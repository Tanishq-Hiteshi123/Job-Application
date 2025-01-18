import { BadRequestException, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SendOTPOnEmailDTO } from './dtos/sendOTPOnEmail.dto';
@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  //   Creating the transporter
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'tanishq.yadav@hiteshi.com',
        pass: 'vxhk ezfd izll hxnm',
      },
    });
  }

  async sendOTPOnEmail(sendOTPData: SendOTPOnEmailDTO): Promise<boolean> {
    const { email, otp } = sendOTPData;
    let isMailSent = false;
    try {
      if (!email || !otp) {
        throw new BadRequestException('Both fields are required');
      }

      await this.transporter.sendMail({
        from: 'tanishq.hiteshi@gmail.com',
        to: email,
        subject: 'Email Verification',
        text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
      });
      isMailSent = true;
    } catch (error) {
      console.error(`Failed to send email to ${email}:`, error);
      isMailSent = false;
      throw error;
    } finally {
      return isMailSent;
    }
  }
}
