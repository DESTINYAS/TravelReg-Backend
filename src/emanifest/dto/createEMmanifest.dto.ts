// src/emanifest/dto/create-emanifest.dto.ts

import { IsArray, ArrayMinSize, IsNotEmpty, ValidateNested, IsNumber, IsString, IsObject, Validate } from 'class-validator';
import { Type } from 'class-transformer';

export class RouteDto {
  @IsNotEmpty()
  @IsString()
  from: string;

  @IsNotEmpty()
  @IsString()
  to: string;
}

class PassengerDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  destinationAddress: string;

  @IsNotEmpty()
  @IsString()
  age: string;

  @IsNotEmpty()
  @IsString()
  sex: string;

  @IsNotEmpty()
  @IsString()
  maritalStatus: string;

  @IsNotEmpty()
  @IsString()
  nextOfKinName: string;

  @IsNotEmpty()
  @IsString()
  nextOfKinAddress: string;

  @IsNotEmpty()
  @IsString()
  nextOfKinPhoneNumber: string;

  @IsNotEmpty()
  @IsString()
  relationshipWithNextOfKin: string;
}

export class CreateEmanifestDto {
  @IsObject()
  @ValidateNested()
  @Type(() => RouteDto)
  route: RouteDto;

  @IsNumber()
  @IsNotEmpty()
  numberOfPassengers: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PassengerDto)
  passengers: PassengerDto[];
}
