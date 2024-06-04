/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import {
  IsEmail,
  IsEnum,
  isNotEmpty,
  IsOptional,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';
import TravelRegRoles from '../../roles/roles.enum';
import Gender from '../../roles/gender.enum';

export  class RegisterDto {
  @IsPhoneNumber('NG')
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  nin: string;

  @IsString()
  @IsNotEmpty()
  age: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  @IsNotEmpty()
  maritalStatus: string;

  @IsString()
  @IsNotEmpty()
  drivExperience: string;

  @IsOptional()
  guarantorName: string;
  
  @IsOptional()
  plateNumber: string;

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
export default RegisterDto