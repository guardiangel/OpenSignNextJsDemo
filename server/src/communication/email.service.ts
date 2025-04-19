import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createTransport } from 'nodemailer';
import * as dotenv from 'dotenv';
import open_sign_invitation from '@/communication/templates/open_sign_invitation';
dotenv.config();

@Injectable()
export class EmailService {
  public emailTemplates = {
    open_sign_invitation: open_sign_invitation,
  };
  private transporter;
  constructor(private jwtService: JwtService) {
    const smtpConfig = {
      service: 'gmail',
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER_EMAIL,
        pass: process.env.SMTP_PASS,
      },
    };

    this.transporter = createTransport(smtpConfig);
  }

  async sendOpenSignOptEmail(
    from: string,
    recipient: string,
    subject: string,
    text: string,
    html: string,
  ) {
    console.log('sendOpenSignOptEmail***********');
    const mailOptions = {
      from: from,
      to: recipient,
      subject: subject,
      text: text,
      html: html,
    };
    try {
      console.log(
        `sendOpenSignOptEmail from ${mailOptions.from} to ${mailOptions.to} with Subject ${mailOptions.subject}`,
      );
      await this.transporter.sendMail(mailOptions);
    } catch (e) {
      console.log('sendEmail', e.toString(), mailOptions);
    }
  }
}
