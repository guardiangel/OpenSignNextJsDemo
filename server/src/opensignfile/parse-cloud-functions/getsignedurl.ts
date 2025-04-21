import Parse from 'parse/node';
import { fileAdapterId_common, useLocal } from '@/utils/UtilsForOpenSign';

export function defineGetsignedurl() {
  Parse.Cloud.define('getsignedurl', async (request) => {
    try {
      const docId = request.params.docId || '';
      const templateId = request.params.templateId || '';
      const url = request.params.url;
      const fileAdapterId =
        request.params.fileAdapterId || fileAdapterId_common;

      if (docId || templateId) {
        try {
          if (fileAdapterId || useLocal !== 'true') {
            const query = new Parse.Query(
              docId ? 'contracts_Document' : 'contracts_Template',
            );
            query.equalTo('objectId', docId ? docId : templateId);
            query.include('ExtUserPtr.TenantId');
            query.notEqualTo('IsArchive', true);
            const res = await query.first({ useMasterKey: true });
            if (res) {
              const _resDoc = JSON.parse(JSON.stringify(res));
              if (_resDoc?.IsEnableOTP) {
                if (!request?.user) {
                  throw new Parse.Error(
                    Parse.Error.INVALID_SESSION_TOKEN,
                    'User is not authenticated.',
                  );
                } else {
                  let adapterConfig = {};
                  if (fileAdapterId) {
                    // `adapterConfig` is used to get file in user's fileAdapter
                    adapterConfig =
                      _resDoc?.ExtUserPtr?.TenantId?.FileAdapters?.find(
                        (x) => x.id === fileAdapterId,
                      ) || {};
                  }
                  const presignedUrl = getPresignedUrl(url, adapterConfig);
                  return presignedUrl;
                }
              } else {
                let adapterConfig = {};
                if (fileAdapterId) {
                  // `adapterConfig` is used to get file in user's fileAdapter
                  adapterConfig =
                    _resDoc?.ExtUserPtr?.TenantId?.FileAdapters?.find(
                      (x) => x.id === fileAdapterId,
                    ) || {};
                }
                const presignedUrl = getPresignedUrl(url, adapterConfig);
                return presignedUrl;
              }
            }
          } else {
            return url;
          }
        } catch (err:any) {
          console.log('Err in presigned url', err);
          throw err;
        }
      } else {
        if (!request?.user) {
          throw new Parse.Error(
            Parse.Error.INVALID_SESSION_TOKEN,
            'User is not authenticated.',
          );
        } else {
          if (useLocal !== 'true') {
            const presignedUrl = getPresignedUrl(url, null);
            return presignedUrl;
          } else {
            return url;
          }
        }
      }
    } catch (err:any) {
      console.log('error in getsignedurl', err);
      const code = err.code || 400;
      const msg = err.message;
      const error = new Parse.Error(code, msg);
      throw error;
    }
  });
}

export default function getPresignedUrl(url, adapter) {
  // Create a new URL object
  const parsedUrl = new URL(url);
  // Get the pathname of the URL
  const pathname = parsedUrl.pathname;
  // Extract the filename from the pathname
  const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
  // return presignedGETURL;
  return url;
}
