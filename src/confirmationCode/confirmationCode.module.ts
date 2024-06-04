/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfirmationCodeService } from './confirmationCodeService';
import ConfirmationCode from './entities/confirmationCode.entity';
import { TwilioService } from 'src/sms/twilio.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([ConfirmationCode]),
        ConfigModule],
    controllers: [],

    providers: [
        ConfirmationCodeService,TwilioService
],

    exports: [ConfirmationCodeService],
})
export class ConfirmationCodeModule { }
