/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */

import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Length, MinLength } from "class-validator";
import TravelRegRoles from "../../roles/roles.enum";
import Gender from "../../roles/gender.enum"

export class CreateUserDto {

  @IsPhoneNumber('NG')
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @Length(11, 11) 
  nin: string;

  @IsString()
  @IsNotEmpty()
  age: string;
  
  @IsEnum(Gender)
  gender: Gender

  @IsOptional()
  maritalStatus: string;

  @IsString()
  @IsNotEmpty()
  drivExperience: string;

  @IsOptional()
  plateNumber: string;

  @IsOptional()
  guarantorName: string;

  @IsOptional()
  guarantorAddress: string;

  @IsOptional()
  guarantorPhoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  password: string;

  @IsString()
  @IsNotEmpty()
  homeAddress: string;

  @IsEnum(TravelRegRoles)
  role: TravelRegRoles;

  @IsEmail()
  @IsOptional()
  email: string;
}

export default CreateUserDto;