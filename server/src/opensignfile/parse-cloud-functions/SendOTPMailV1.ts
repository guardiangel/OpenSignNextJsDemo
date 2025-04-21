import Parse from 'parse/node';
import { EmailService } from '@/communication/email.service';
import { appName, smtpenable, updateMailCount } from '@/utils/UtilsForOpenSign';

export function defineSendOTPMailV1(emailService: EmailService) {
  Parse.Cloud.define('SendOTPMailV1', async (request) => {
    try {
      //--for elearning app side
      let code = Math.floor(1000 + Math.random() * 9000);
      let email = request.params.email;
      var TenantId = request.params.TenantId
        ? request.params.TenantId
        : undefined;

      console.log(
        `SendOTPMailV1 SendOTPMailV1 email:${email}, code:${code},TenantId:${TenantId}`,
      );

      if (email) {
        const recipient = request.params.email;
        const mailsender = smtpenable
          ? process.env.SMTP_USER_EMAIL
          : process.env.MAILGUN_SENDER;
        try {
          await emailService.sendOpenSignOptEmail(
            appName + ' <' + mailsender + '>',
            recipient,
            `Your ${appName} OTP`,
            'This email is a test.',
            `<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body><div style='background-color:#f5f5f5;padding:20px'><div style='box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;background-color:white;'><div style='background-color:red;padding:2px;font-family:system-ui; background-color:#47a3ad;'>    <p style='font-size:20px;font-weight:400;color:white;padding-left:20px',>OTP Verification</p></div><div style='padding:20px'><p style='font-family:system-ui;font-size:14px'>Your OTP for ${appName} verification is:</p><p style=' text-decoration: none; font-weight: bolder; color:blue;font-size:45px;margin:20px'>` +
              code +
              '</p></div> </div> </div></body></html>',
          );

          if (request.params?.docId) {
            const extUserId = await getDocument(request.params?.docId);

            if (extUserId) {
              updateMailCount(extUserId, 'freeplan', true);
            }
          }
        } catch (err:any) {
          console.log('error in send OTP mail', err);
        }
        const tempOtp = new Parse.Query('defaultdata_Otp');
        tempOtp.equalTo('Email', email);
        const resultOTP = await tempOtp.first({ useMasterKey: true });
        if (resultOTP !== undefined) {
          const updateOtpQuery = new Parse.Query('defaultdata_Otp');
          const updateOtp = await updateOtpQuery.get(resultOTP.id, {
            useMasterKey: true,
          });
          updateOtp.set('OTP', code);
          updateOtp.save(null, { useMasterKey: true });
        } else {
          const otpClass = Parse.Object.extend('defaultdata_Otp');
          const newOtpQuery = new otpClass();
          newOtpQuery.set('OTP', code);
          newOtpQuery.set('Email', email);
          newOtpQuery.set('TenantId', TenantId);
          await newOtpQuery.save(null, { useMasterKey: true });
        }
        return 'Otp send';
      } else {
        return 'Please Enter valid email';
      }
    } catch (err:any) {
      console.log('err in sendMailOTPv1');
      console.log(err);
      return err;
    }
  });
}

async function getDocument(docId) {
  try {
    const query = new Parse.Query('contracts_Document');
    query.equalTo('objectId', docId);
    query.include('ExtUserPtr');
    query.include('CreatedBy');
    query.include('Signers');
    query.include('AuditTrail.UserPtr');
    query.include('ExtUserPtr.TenantId');
    query.include('Placeholders');
    query.notEqualTo('IsArchive', true);
    const res = await query.first({ useMasterKey: true });
    const _res = res.toJSON();
    return _res?.ExtUserPtr?.objectId;
  } catch (err:any) {
    console.log('err ', err);
  }
}
