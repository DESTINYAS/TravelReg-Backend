/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body,Param, UseGuards, Req, Query } from '@nestjs/common';
import ParkService  from './park.service';
import CreateParkDto from './dto/create-park.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import RoleAndJWTAuthenticationGuard from 'src/authentication/guards/role.and-jwt-authentication.guard';
import TravelRegRoles from 'src/roles/roles.enum';
import RequestWithUser from 'src/authentication/requestWithUser.interface';
import Park from './entities/park.entity';
import { PaginationParams } from 'src/utils/paginationParams';
import FindOneParams from 'src/utils/findOneParams';
import JwtAuthenticationGuard from 'src/authentication/guards/jwt-authentication.guard';
import AreaService from 'src/area/area.service';


@Controller('Park')
@ApiTags('Parks')
export default class ParkController {
  constructor(private readonly parkService: ParkService,
    
    private readonly areaService: AreaService,
    ) {}

  @Post()
  @UseGuards(RoleAndJWTAuthenticationGuard(TravelRegRoles.Admin))
  @ApiBearerAuth()
  async createPark(@Body() park: CreateParkDto, @Req() req: RequestWithUser) {
    return await this.parkService.createPark(park);
  }


  @Get()
  @ApiQuery({
    name: 'limit',
    type: "number",
    description:
      'The total records to return',
  })
  @ApiQuery({
    name: 'skip',
    type: "number",
    description:
      'The number of records to skip',
  })
  async getAllParks(
    @Query() { skip, limit }: PaginationParams
  ): Promise<Park[]> {
    return await this.parkService.getAllParks(skip, limit);
  }

 
   @Get(':id')
  @ApiParam({
    name: "id",
    type: "string"
  })
  async getParkById(@Param() { id }: FindOneParams) {
    return this.parkService.getParkById(id);
  }

  @Get('parks-areas/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @ApiParam({
    name: 'id',
    description:
      'The Area  ID of the parks you are retrieving.',
  })
  @ApiOperation({
    description:
      'Returns the park data.',
  })
  async getAllParksByArea(@Param() { id }: FindOneParams) {
    const area = await this.areaService.getAreaById(id);
    return await this.parkService.getAllParksByArea(area);
  }

}
