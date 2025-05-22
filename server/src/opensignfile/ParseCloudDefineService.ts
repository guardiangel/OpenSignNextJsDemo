import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Public } from '@/auth/decorators/public.decorator';
import { EmailService } from '@/communication/email.service';

import { defineAddadmin } from './parse-cloud-functions/addadmin';
import { defineAllowedusers } from './parse-cloud-functions/allowedusers';
import { defineAuthLoginAsMail } from './parse-cloud-functions/AuthLoginAsMail';
import { defineBuyaddonusers } from './parse-cloud-functions/buyaddonusers';
import { defineCallwebhook } from './parse-cloud-functions/callwebhook';
import { defineDeclinedoc } from './parse-cloud-functions/declinedoc';
import { defineGetcontact } from './parse-cloud-functions/getcontact';
import { defineGetDocument } from './parse-cloud-functions/getDocument';
import { defineGetDrive } from './parse-cloud-functions/getDrive';
import { defineGetReport } from './parse-cloud-functions/getReport';
import { defineGetsignedurl } from './parse-cloud-functions/getsignedurl';
import { defineGetsigners } from './parse-cloud-functions/getsigners';
import { defineGetsubscriptions } from './parse-cloud-functions/getsubscriptions';
import { defineGetteams } from './parse-cloud-functions/getteams';
import { defineGetTemplate } from './parse-cloud-functions/getTemplate';
import { defineGettenant } from './parse-cloud-functions/gettenant';
import { defineGetUserDetails } from './parse-cloud-functions/getUserDetails';
import { defineGetUserId } from './parse-cloud-functions/getUserId';
import { defineGetuserlistbyorg } from './parse-cloud-functions/getuserlistbyorg';
import { defineIsuserincontactbook } from './parse-cloud-functions/isuserincontactbook';
import { defineLinkcontacttodoc } from './parse-cloud-functions/linkcontacttodoc';
import { definePublicuserlinkcontacttodoc } from './parse-cloud-functions/publicuserlinkcontacttodoc';
import { defineSavecontact } from './parse-cloud-functions/savecontact';
import { defineSavetofileadapter } from './parse-cloud-functions/savetofileadapter';
import { defineSendmailv3 } from './parse-cloud-functions/sendmailv3';
import { defineSendOTPMailV1 } from './parse-cloud-functions/SendOTPMailV1';
import { defineSignPDF } from './parse-cloud-functions/signPDF';
import { defineUpdatecontacttour } from './parse-cloud-functions/updatecontacttour';
import { defineVerifyemail } from './parse-cloud-functions/verifyemail';
import { Pinecone } from '@pinecone-database/pinecone';
import { defineLoadPDF } from './parse-cloud-functions/aiChatBot';
import { Configuration, OpenAIApi } from 'openai-edge';
import {
  Document as LlamaDocument,
  LlamaParseReader,
  Metadata,
} from 'llamaindex';

@Injectable()
@Public()
export class ParseCloudDefineService implements OnModuleInit {
  private getPineconeClient: Pinecone;
  private openai: OpenAIApi;
  private llamaReader: LlamaParseReader;
  private config: Configuration;
  constructor(
    private configService: ConfigService,
    private readonly emailService: EmailService,
  ) {
    this.initPinecone();
    this.initOpenAI();
    this.initLlama();
  }

  private initPinecone(): void {
    this.getPineconeClient = new Pinecone({
      //environment: process.env.PINECONE_ENVIRONMENT!,
      apiKey: this.configService.get('PINECONE_API_KEY'),
    });
  }
  private initOpenAI(): void {
    this.config = new Configuration({
      apiKey: this.configService.get('OPENAI_API_KEY'),
    });
    this.openai = new OpenAIApi(this.config);
  }
  private initLlama(): void {
    this.llamaReader = new LlamaParseReader({
      resultType: 'markdown',
      apiKey: this.configService.get('LLAMA_CLOUD_API_KEY'),
    });
  }

  async onModuleInit() {
    // Define Parse Cloud Function inside NestJS

    defineGettenant();

    defineSignPDF(this.configService);

    defineSendmailv3();

    defineGetsignedurl();

    defineSendOTPMailV1(this.emailService);

    defineVerifyemail();

    defineGetUserDetails();

    defineAddadmin(this.configService);

    //Save file
    defineSavetofileadapter(this.configService);

    defineGetsubscriptions(this.configService);

    defineGetDocument();

    defineAllowedusers();

    defineGetuserlistbyorg();

    defineBuyaddonusers();

    defineGetteams();

    defineGetUserId();

    defineLinkcontacttodoc();

    defineGetTemplate();

    defineDeclinedoc();

    defineAuthLoginAsMail();

    defineCallwebhook();

    defineGetcontact();

    defineUpdatecontacttour();

    definePublicuserlinkcontacttodoc();

    defineGetDrive();

    defineGetReport();

    defineIsuserincontactbook();

    defineSavecontact();

    defineGetsigners();

    defineLoadPDF(
      this.getPineconeClient,
      this.openai,
      this.llamaReader,
      this.config,
      this.configService,
    );

    console.log('Parse Cloud Functions registered in NestJS ✅');
  }
}
