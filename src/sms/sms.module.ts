/* eslint-disable prettier/prettier */
// src/sms/sms.module.ts

import { Module } from '@nestjs/common';
import { TwilioService } from './twilio.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([]),ConfigModule],
  providers: [TwilioService],
  exports: [TwilioService],
})
export class SmsModule {}
