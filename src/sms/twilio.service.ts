/* eslint-disable prettier/prettier */
// src/sms/twilio.service.ts

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Twilio from 'twilio';

@Injectable()
export class TwilioService {
  private readonly client: Twilio.Twilio;

  constructor(private readonly configService: ConfigService) {
    this.client =  Twilio(
      configService.get('TWILIO_ACCOUNT_SID'),
      configService.get('TWILIO_AUTH_TOKEN'),
    );
  }

  async sendSMS(to: string, body: string): Promise<void> {
    try {
      await this.client.messages.create({
        body,
        from: this.configService.get('TWILIO_PHONE_NUMBER'),
        to
      }).then(message => console.log(message.sid));
    } catch (error) {
      // Handle any error, log it, or throw a custom exception if needed
      console.error(`Error sending SMS: ${error.message}`);
      throw new Error('Failed to send SMS');
    }
  }
}
