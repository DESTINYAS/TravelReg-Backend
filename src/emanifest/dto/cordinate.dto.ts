import { IsNumber, Min } from 'class-validator';

export class CoordinateDto {
  @IsNumber()
  // @Min(-90)
  latitude: number;

  @IsNumber()
  // @Min(-180)
  longitude: number;
}