/* eslint-disable prettier/prettier */
import { ApiProperty } from "@nestjs/swagger";


export default class UploadFileDTO {
    @ApiProperty({ type: 'string', format: 'binary' })
    file: any;
}