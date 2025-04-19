import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { ConfigService } from '@nestjs/config';
import * as Parse from 'parse/node'; // Import Parse config
import { isEmpty } from 'radash';
import { FileInput } from '@/azure/azure.input';
import { v4 as uuidv4 } from 'uuid';

export function defineSavetofileadapter(configService: ConfigService) {
  Parse.Cloud.define('savetofileadapter', async (request) => {
    //the request?user is the X-Parse-Session-Token in the headers! X-Parse-Session-Token
    //Get the session token in the _Session table GuiquanSun 20250319
    if (!request?.user) {
      throw new Parse.Error(
        Parse.Error.INVALID_SESSION_TOKEN,
        'User is not authenticated.',
      );
    }

    if (!request.params.fileBase64) {
      throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Please provide file.');
    }
    const fileBase64 = request.params.fileBase64;
    const id = request.params.id;
    try {
      const extCls = new Parse.Query('contracts_Users');
      extCls.equalTo('UserId', request.user);
      extCls.include('TenantId');
      const resExt = await extCls.first({ useMasterKey: true });
      if (resExt) {
        const _resExt = JSON.parse(JSON.stringify(resExt));
        // const fileAdapters = _resExt?.TenantId.FileAdapters || [];
        // const fileAdapter = fileAdapters?.find((x) => x.id === id) || {};
        if (true) {
          const buffer = Buffer.from(fileBase64, 'base64');
          const fileName = request.params.fileName;
          const ext = request.params.fileName?.split('.')?.pop();
          let mimeType;
          if (ext === 'pdf') {
            mimeType = 'application/pdf';
          } else if (ext === 'png' || ext === 'jpeg' || ext === 'jpg') {
            mimeType = `image/${ext}`;
          }
          try {
            const presignedUrl = await uploadFileToAzure(
              {
                name: fileName,
                encodedContent: fileBase64,
                encodingType: 'base64',
                mimeType: mimeType,
              },
              configService,
            );

            return { url: presignedUrl };
          } catch (err:any) {
            console.error('Error generate presigned url:', err);
            const msg = 'Fileadapter credentials are invalid.';
            throw new Parse.Error(400, msg);
          }
        }
      } else {
        throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'User not found.');
      }
    } catch (err:any) {
      console.log('err in savetoS3', err);
      throw err;
    }
  });
}

async function uploadFileToAzure(
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
    `savetofileadapter.ts Upload block blob ${blobName} successfully, the uploaded file location is: ${blockBlobClient.url}`,
  );
  return blockBlobClient.url;
}
