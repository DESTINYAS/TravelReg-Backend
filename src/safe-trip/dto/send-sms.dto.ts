/* eslint-disable prettier/prettier */
import { IsString } from 'class-validator';

export class SendSmsDto {
  @IsString()
  to: string;

  @IsString()
  message: string;

}

export default SendSmsDto;
