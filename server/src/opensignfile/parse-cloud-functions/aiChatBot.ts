import Parse from 'parse/node';
import { ChatOpenAI } from '@langchain/openai';
import {
  Document,
  RecursiveCharacterTextSplitter,
} from '@pinecone-database/doc-splitter';
import {
  Pinecone,
  PineconeRecord,
  RecordMetadata,
  ScoredPineconeRecord,
} from '@pinecone-database/pinecone';
import { equals } from 'class-validator';
import * as fs from 'fs';
import axios from 'axios';
import os from 'os';
import path from 'path';

import { HumanMessage } from '@langchain/core/messages';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import {
  Document as LlamaDocument,
  LlamaParseReader,
  Metadata,
} from 'llamaindex';
import md5 from 'md5';
import { Configuration, OpenAIApi } from 'openai-edge';
import { PDFDocument } from 'pdf-lib';
import { ConfigService } from '@nestjs/config/dist';

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

export function defineLoadPDF(
  globalPineconeClient: Pinecone,
  globalOpenai: OpenAIApi,
  globalLlamaReader: LlamaParseReader,
  globalConfig: Configuration,
  configService: ConfigService,
) {
  Parse.Cloud.define('createFileVectorization', async (request) => {
    try {
      const blobUrl = request.params.blobUrl;
      //Step 1: Download the PDF
      console.log('Step 1: Downloading PDF');

      console.log('blobUrl******:', blobUrl);

      const filename = blobUrl.split('/').pop();

      console.log('filename****:', filename);

      // const downloadedFile = await azureResolver.downloadBlobToFile(blobUrl);
      const downloadedFile = await downloadFileFromUrlToTempFile(blobUrl);

      if (!downloadedFile) {
        throw new Error('could not download file from azure');
      }
      //Step 2: Load PDF into Memory
      console.log('Step 2: Loading PDF into Memory');
      const pages = await loadPDF(downloadedFile);

      //Step 3. Split and segment the pdf
      console.log('Step 3. Splitting and segmenting the pdf');
      const documents = await Promise.all(
        pages.map((page) => prepareDocument(page)),
      );

      //Step 4: Vectorise and embed individual documents
      console.log('Step 4: Vectorise and embed individual documents');
      const vectors = await Promise.all(
        documents.flat().map((document) => embedDocument(document)),
      );

      //Step 5: Uploading vectors to pinecone
      console.log('Step 5: Uploading vectors to pinecone');
      const pineconeIndex = await globalPineconeClient.index('ind');
      const namespace = pineconeIndex.namespace(convertToAscii(downloadedFile));

      await namespace.upsert(vectors);
      return downloadedFile;
    } catch (error) {
      console.log('createFileVectorization error:', error);
    }
  });

  Parse.Cloud.define('getChatbotResponse', async (request) => {
    const userQuery = request.params.userQuery;
    const namespace = request.params.namespace;

    const context = await getContext(userQuery, namespace);
    console.log('🚀 ~ AiService ~ namespace:', namespace);

    const chat = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo-1106',
      temperature: 0.2,
    });

    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `AI assistant is a brand new, powerful, human-like artificial intelligence.
        The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
        AI is a well-behaved and well-mannered individual.
        AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
        AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
        START CONTEXT BLOCK
        ${context}
        END OF CONTEXT BLOCK
        AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation. This context block data is provided from an uploaded pdf.
        If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
        AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
        AI assistant will not invent anything that is not drawn directly from the context.
        Never mention about context block. Refer the information as pdf data.
      `,
      ],
      new MessagesPlaceholder('messages'),
    ]);

    const chain = prompt.pipe(chat);
    //Improvement: For conversational bot, store the chat in database and feed it to each message invocation
    // messages:[
    //   new HumanMessage(
    //       'Translate this sentence from English to French: I love programming.',
    //     ),
    //     new AIMessage("J'adore la programmation."),
    //     new HumanMessage('What did you just say?'),
    // ]
    const response = await chain.invoke({
      messages: [new HumanMessage(userQuery)],
    });
    return String(response?.content ?? '') ?? '';
  });

  async function downloadFileFromUrlToTempFile(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const tempFilePath = path.join(os.tmpdir(), `downloaded_${Date.now()}.pdf`);
    await fs.promises.writeFile(tempFilePath, response.data);
    return tempFilePath;
  }

  async function loadPDF(
    filePath: string,
  ): Promise<LlamaDocument<Metadata>[] | PDFPage[]> {
    const fileNameWithoutExtension = filePath.substring(
      0,
      filePath.lastIndexOf('.pdf'),
    );

    //Step 1: Load PDF using langchain
    const loader = new PDFLoader(filePath);
    const pages = (await loader.load()) as PDFPage[];
    let finalPages = [];
    //If pdf is not readable by langchain, read it directly using llama
    if (equals(pages.length, 0))
      finalPages = await globalLlamaReader.loadData(filePath);
    else {
      //Step 2: Load Pdf using pdf lib
      const docmentAsBytes = await fs.promises.readFile(filePath);
      const pdfDoc = await PDFDocument.load(docmentAsBytes);

      finalPages = await Promise.all(
        pages.map(async (page, index) => {
          //Step 3: Split each page into separate pdf
          const subDocument = await PDFDocument.create();
          const [copiedPage] = await subDocument.copyPages(pdfDoc, [index]);
          subDocument.addPage(copiedPage);
          const pdfBytes = await subDocument.save();

          const splittedPagePdf = `${fileNameWithoutExtension}-${index + 1}.pdf`;
          await fs.promises.writeFile(splittedPagePdf, pdfBytes);
          //Step 4: Read each splitted Pdf content using LlamaParser
          const documents = await globalLlamaReader.loadData(splittedPagePdf);
          //Step 5: Delete the splitted Pdf
          deleteFile(splittedPagePdf);
          // Step 6: Pick all the data loaded from langchain loader and replace pagecontent using content loaded from LlamaParser
          return { ...page, pageContent: documents[0].text };
        }),
      );
    }
    //Step 7: Delete the original downloaded file.
    deleteFile(filePath);
    //Step 8: Return the final data for further processing
    return finalPages;
  }

  async function deleteFile(filePath: string): Promise<any> {
    fs.unlink(filePath, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          return 'File does not exist.';
        } else {
          throw err;
        }
      } else {
        return 'File deleted!';
      }
    });
  }

  async function prepareDocument(page: any): Promise<any> {
    // eslint-disable-next-line prefer-const
    let { pageContent = '', metadata, text = '' } = page;
    const cleanedContent: string = !equals(pageContent, '')
      ? pageContent.replace(/\n/g, '')
      : !equals(text, '')
        ? text.replace(/\n/g, ' ')?.replace(/\s+/g, ' ')
        : '';

    // split the docs
    const splitter = new RecursiveCharacterTextSplitter();
    const docs = await splitter.splitDocuments([
      new Document({
        pageContent: cleanedContent,
        metadata: {
          pageNumber: metadata?.loc?.pageNumber ?? 1,
          text: truncateStringByBytes(cleanedContent, 36000),
        },
      }),
    ]);
    return docs;
  }

  async function getEmbeddings(text: string): Promise<number[]> {
    try {
      const response = await globalOpenai.createEmbedding({
        model: configService.get('OPENAI_TEXT_EMBEDDING_MODEL'),
        input: text.replace(/\n/g, ' '),
      });
      const result = await response.json();
      return result.data[0].embedding as number[];
    } catch (error) {
      console.log('error calling openai embeddings api', error);
      throw error;
    }
  }

  async function embedDocument(doc: Document): Promise<PineconeRecord> {
    try {
      const embeddings = await getEmbeddings(doc.pageContent);
      const hash = md5(doc.pageContent);

      return {
        id: hash,
        values: embeddings,
        metadata: {
          text: doc.metadata.text,
          pageNumber: doc.metadata.pageNumber,
        },
      } as PineconeRecord;
    } catch (error) {
      console.log('error embedding document', error);
      throw error;
    }
  }
  function truncateStringByBytes(str: string, bytes: number) {
    const enc = new TextEncoder();
    return new TextDecoder('utf-8').decode(enc.encode(str).slice(0, bytes));
  }

  function convertToAscii(inputString: string) {
    // remove non ascii characters
    const asciiString = inputString.replace(/[^\x00-\x7F]+/g, '');
    return asciiString;
  }

  async function getMatchesFromEmbeddings(
    embeddings: number[],
    fileNamespace: string,
  ): Promise<ScoredPineconeRecord<RecordMetadata>[]> {
    try {
      const pineconeIndex = await globalPineconeClient.index('ind');
      const namespace = pineconeIndex.namespace(convertToAscii(fileNamespace));

      const queryResult = await namespace.query({
        topK: 50,
        vector: embeddings,
        includeMetadata: true,
      });

      return queryResult.matches || [];
    } catch (error) {
      console.log('error querying embeddings', error);
      throw error;
    }
  }

  async function getContext(
    userQuery: string,
    fileNamespace: string,
  ): Promise<string> {
    const queryEmbeddings = await getEmbeddings(userQuery);

    const matches = await getMatchesFromEmbeddings(
      queryEmbeddings,
      fileNamespace,
    );

    const qualifyingDocs = matches
      .filter((match) => match.score && match.score > 0.1)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    type Metadata = {
      text: string;
      pageNumber: number;
    };

    const docs = qualifyingDocs.map(
      (match) => (match.metadata as Metadata).text,
    );
    // 5 vectors
    return docs.join('\n').substring(0, 3000);
  }
}
