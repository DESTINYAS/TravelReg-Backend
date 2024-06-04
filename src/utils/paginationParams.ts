/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { IsNumber, Min, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ManifestStatus } from 'src/roles/manifestStatus';
import { ApprovalStatus } from 'src/roles/approveManifest';

export enum OrderDirection {
    ASC = 'ASC',
    DESC = 'DESC'
}

export enum Orderby {
    DATE_CREATED = 'DATE_CREATED'
}


export class PaginationParams {
    @ApiProperty({ default: 0 })
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    skip?: number;

    @ApiProperty({ default: 10 })
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number;

    @ApiProperty({ enum: Orderby, default: Orderby.DATE_CREATED })
    order_by?: Orderby

    @ApiProperty({ enum: OrderDirection, default: OrderDirection.DESC })
    order_direction?: OrderDirection
}

export class EmanifestPaginationParams extends PaginationParams{

    @ApiProperty({ enum: ManifestStatus,required: false })
    @IsOptional()
    status?: ManifestStatus

    @ApiProperty({ enum: ApprovalStatus,required: false })
    @IsOptional()
    approved?: ApprovalStatus

}

export class EmanifestPaginationParamsAdmin extends PaginationParams{

    @ApiProperty({ enum: ManifestStatus,required: false })
    @IsOptional()
    status?: ManifestStatus

    @ApiProperty({ enum: ApprovalStatus,required: false })
    @IsOptional()
    approved?: ApprovalStatus

    @ApiProperty({ type: "uuid", required: false })
    @IsUUID()
    @IsOptional()
    driverId: string

    @ApiProperty({ type: "uuid", required: false })
    @IsUUID()
    @IsOptional()
    parkId: string

    @ApiProperty({ type: "uuid", required: false })
    @IsUUID()
    @IsOptional()
    areaId: string


}