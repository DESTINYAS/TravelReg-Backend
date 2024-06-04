// update-manifest.dto.ts

import { IsEnum, IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CoordinateDto } from './cordinate.dto';
import { ApprovalStatus } from 'src/roles/approveManifest';

export class UpdateManifestStartCordinateDto {
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => CoordinateDto)
    startCoordinates: CoordinateDto;
}

export class UpdateManifestEndCordinateDto {

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => CoordinateDto)
    endCoordinates: CoordinateDto;

  }
export class UpdateLocationDto {

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => CoordinateDto)
    newCoordinates: CoordinateDto;

  }
  
  export class UpdateApprovalDto {
    @IsEnum(ApprovalStatus)
    approvalStatus: ApprovalStatus;
  }