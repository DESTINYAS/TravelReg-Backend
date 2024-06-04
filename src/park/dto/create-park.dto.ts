/* eslint-disable prettier/prettier */

/* eslint-disable prettier/prettier */

import {  IsString, MaxLength } from "class-validator"

export default class CreateParkDto {
    
    @IsString()
    @MaxLength(100)
    title: string

    @IsString()
    @MaxLength(200)
    address: string

    @IsString()
    areaId: string;

}