/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/swagger';
import  RegisterDto  from './register.dto';

export class UpdateAuthenticationDto extends PartialType(RegisterDto) {}
