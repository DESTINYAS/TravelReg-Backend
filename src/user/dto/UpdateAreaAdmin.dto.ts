import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export default class UpdateAreaAdminDTO {

    @IsUUID()
    @IsNotEmpty()
    areaID: string
}

export class UpdateninAdminDTO{
    @IsNotEmpty()
    nin:string
}