/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */

import {  IsPhoneNumber } from 'class-validator';

export default class ResendConfirmPhoneCode {

    @IsPhoneNumber("NG")
    originalPhoneNumber: string

    @IsPhoneNumber("NG")
    newPhoneNumber: string
}

export class SendConfirmPhoneNumber {

    @IsPhoneNumber("NG")
    phoneNumber: string
}