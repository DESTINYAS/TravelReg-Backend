/* eslint-disable prettier/prettier */
import { IsPhoneNumber, IsString, MinLength } from "class-validator";

export class LoginDTO {
    @IsPhoneNumber("NG")
    phoneNumber: string;

    @IsString()
    @MinLength(7)
    readonly password: string;


}

export default LoginDTO;