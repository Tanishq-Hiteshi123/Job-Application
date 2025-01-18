import { Process, Processor } from '@nestjs/bull';
import { EmailService } from './email.service';
import { Job } from 'bullmq';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

// Creating the email processor -- it is continueously listening the queue
@Processor('emailQueue')
export class EmailProcessor {
  constructor(private emailService: EmailService) {
    console.log('Process in started');
  }
  @Process('sendotp')
  async handleSendOTPOnEmail(job: Job) {
    const { email, otp } = job.data;

    console.log('In send OTP Process ', email, otp);

    try {
      if (!email || !otp) {
        throw new BadRequestException('Email and OTP is not provided');
      }

      const isMailSent = await this.emailService.sendOTPOnEmail({ email, otp });
      if (!isMailSent) {
        throw new InternalServerErrorException(
          'Email could not get send from processor',
        );
      }

      console.log('Email send SuccessFully');
    } catch (error) {
      console.log(`Error In Processor ${error}`);
      throw error;
    }
  }
}
