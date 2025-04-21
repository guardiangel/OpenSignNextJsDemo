import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { ConfigService } from '@nestjs/config';
import { isEmpty } from 'radash';
import { FileInput } from '@/azure/azure.input';
import { v4 as uuidv4 } from 'uuid';

export default async function uploadFileToAzure(
  uploadFileInput: FileInput,
  configService: ConfigService,
) {
  const blobUrl = await uploadAndGetBlob(
    configService,
    uploadFileInput.name,
    uploadFileInput.encodedContent,
  );
  return { blobUrl };
}

function getContainerClient(configService: ConfigService): ContainerClient {
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    configService.get('AZURE_CONNECTION'),
  );
  const containerClient = blobServiceClient.getContainerClient(
    configService.get('CONTAINER_NAME'),
  );
  return containerClient;
}

async function uploadAndGetBlob(
  configService: ConfigService,
  fileName: string,
  base64content: string,
  contentType?: string,
): Promise<string> {
  const content = Buffer.from(base64content, 'base64');
  const uuid = uuidv4();
  const blobName = `${uuid}-${fileName}`;
  const containerClient = getContainerClient(configService);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const uploadBlobResponse = isEmpty(contentType)
    ? await blockBlobClient.upload(content, content.length)
    : await blockBlobClient.upload(content, content.length, {
        blobHTTPHeaders: {
          blobContentType: contentType,
          blobCacheControl: 'public, max-age=31536000',
        },
      });

  console.log(
    `uploadFileToAzure.ts Upload block blob ${blobName} successfully, the uploaded file location is: ${blockBlobClient.url}`,
  );
  return blockBlobClient.url;
}
