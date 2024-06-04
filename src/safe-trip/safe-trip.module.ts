/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { SafeTripController } from './safe-trip.controller';
import { TwilioService } from 'src/sms/twilio.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([]),ConfigModule],
  controllers: [SafeTripController],
  providers: [TwilioService],
})
export class SafeTripModule {}
