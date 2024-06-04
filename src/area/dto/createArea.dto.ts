/* eslint-disable prettier/prettier */
import {  IsString, MaxLength } from "class-validator"

export default class CreateAreaDTO {
    
    @IsString()
    @MaxLength(100)
    title: string

}