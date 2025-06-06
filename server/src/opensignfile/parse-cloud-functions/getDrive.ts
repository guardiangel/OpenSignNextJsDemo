import axios from 'axios';
import * as dotenv from 'dotenv';
import Parse from 'parse/node';
import { cloudServerUrl } from '@/utils/UtilsForOpenSign';
dotenv.config();

export function defineGetDrive() {
  Parse.Cloud.define('getDrive', async (request) => {
    const serverUrl = cloudServerUrl; //process.env.SERVER_URL;
    const appId = process.env.XParseApplicationId;
    const limit = request.params.limit;
    const skip = request.params.skip;
    const classUrl = serverUrl + '/classes/contracts_Document';
    const docId = request.params.docId;
    try {
      const userRes = await axios.get(serverUrl + '/users/me', {
        headers: {
          'X-Parse-Application-Id': appId,
          'X-Parse-Session-Token': request.headers['sessiontoken'],
        },
      });
      const userId = userRes.data && userRes.data.objectId;
      if (userId) {
        let url;
        if (docId) {
          url = `${classUrl}?where={"Folder":{"__type":"Pointer","className":"contracts_Document","objectId":"${docId}"},"CreatedBy":{"__type":"Pointer","className":"_User","objectId":"${userId}"},"IsArchive":{"$ne":true}}&include=ExtUserPtr,ExtUserPtr.TenantId,Signers,Folder&order=-updatedAt&skip=${skip}&limit=${limit}`;
        } else {
          url = `${classUrl}?where={"Folder":{"$exists":false},"CreatedBy":{"__type":"Pointer","className":"_User","objectId":"${userId}"},"IsArchive":{"$ne":true}}&include=ExtUserPtr,ExtUserPtr.TenantId,Signers&order=-updatedAt&skip=${skip}&limit=${limit}`;
        }
        try {
          const res = await axios.get(url, {
            headers: {
              'X-Parse-Application-Id': appId,
              'X-Parse-Master-key': process.env.MASTER_KEY,
            },
          });
          if (res.data && res.data.results) {
            return res.data.results;
          } else {
            return [];
          }
        } catch (err:any) {
          console.log('err', err);
          return { error: "You don't have access to drive" };
        }
      } else {
        return { error: 'Please provide required parameter!' };
      }
    } catch (err:any) {
      console.log('err', err);
      if (err.code == 209) {
        return { error: 'Invalid session token' };
      } else {
        return { error: "You don't have access!" };
      }
    }
  });
}
