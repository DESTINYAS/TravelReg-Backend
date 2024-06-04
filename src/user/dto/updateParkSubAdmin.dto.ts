import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export default class UpdateParkAdminDTO {

    @IsUUID()
    @IsNotEmpty()
    parkID: string
}