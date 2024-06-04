/* eslint-disable prettier/prettier */
import {  IsOptional, IsString, MaxLength } from "class-validator"

export default class UpdateAreaDTO {
    
    @IsString()
    @MaxLength(100)
    @IsOptional()
    title: string
}