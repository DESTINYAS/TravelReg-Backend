/* eslint-disable prettier/prettier */
// safe-trip.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { TwilioService } from '../sms/twilio.service'; // Import TwilioService
import { ApiTags } from '@nestjs/swagger';
import SendSmsDto from './dto/send-sms.dto';

@ApiTags("sms")
@Controller('safe-trip')
export class SafeTripController {
  constructor(private readonly twilioService: TwilioService) {}

  // @Post('send-sms')
  // async sendSms(@Body() data: SendSmsDto): Promise<void> {
  //   await this.twilioService.sendSMS(data.to, data.message);
  // }
}
