import axios from 'axios';
import Parse from 'parse/node';
import { cloudServerUrl } from '@/utils/UtilsForOpenSign';

export function defineAuthLoginAsMail() {
  Parse.Cloud.define('AuthLoginAsMail', async (request) => {
    try {
      //function for login user using user objectId without touching user's password
      const serverUrl = cloudServerUrl; //process.env.SERVER_URL;
      const APPID = process.env.APP_ID;
      const masterKEY = process.env.MASTER_KEY;

      let otpN = request.params.otp;
      let otp = parseInt(otpN);
      let email = request.params.email;

      let message;
      //checking otp is correct or not which already save in defaultdata_Otp class
      const checkOtp = new Parse.Query('defaultdata_Otp');
      checkOtp.equalTo('Email', email);
      const res = await checkOtp.first({ useMasterKey: true });

      if (res !== undefined) {
        let resOtp = res.get('OTP');

        if (resOtp === otp) {
          var result: any = await getToken(request);
          if (result && !result?.emailVerified) {
            const userQuery = new Parse.Query(Parse.User);
            const user = await userQuery.get(result?.objectId, {
              sessionToken: result.sessionToken,
            });
            // Update the emailVerified field to true
            user.set('emailVerified', true);
            // Save the user object
            const res = await user.save(null, { useMasterKey: true });
            if (res) {
              return result;
            } else {
              throw new Error('User not found!');
            }
          } else {
            return result;
          }

          async function getToken(request) {
            return new Promise(function (resolve, reject) {
              var query = new Parse.Query(Parse.User);
              query.equalTo('email', email);
              query
                .first({ useMasterKey: true })
                .then((user) => {
                  // call loginAs function to use login method passing user objectId as a userId
                  const url = `${serverUrl}/loginAs`;
                  axios({
                    method: 'POST',
                    url: url,
                    headers: {
                      'Content-Type': 'application/json;charset=utf-8',
                      'X-Parse-Application-Id': APPID,
                      'X-Parse-Master-Key': masterKEY,
                    },
                    params: {
                      userId: user.id,
                    },
                  })
                    .then(function (res) {
                      if (res.data) {
                        resolve(res.data);
                      } else {
                        reject(new Error('User not found!'));
                      }
                    })
                    .catch((err) => {
                      reject(new Error('User not found!'));
                    });

                  // user couldn't find lets sign up!
                })
                .catch(() => {
                  reject(new Error('User not found!'));
                });
            });
          }
        } else {
          message = `Invalid OTP`;
          return message;
        }
      } else {
        message = 'User not found!';
        return message;
      }
    } catch (err:any) {
      console.log('Error in Auth');
      console.log(err);
      return `Result not found: ${err.message}`;
    }
  });
}
