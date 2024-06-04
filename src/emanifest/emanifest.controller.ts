import { Controller, Post, Body, Param, Patch, UseGuards, Req, ParseIntPipe, Get, NotFoundException, Query } from '@nestjs/common';
import { EmanifestService } from './emanifest.service';
import { CreateEmanifestDto } from './dto/createEMmanifest.dto';
import  EmanifestEntity  from './entities/emanifest.entity';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateApprovalDto, UpdateLocationDto, UpdateManifestEndCordinateDto, UpdateManifestStartCordinateDto } from './dto/updateCordinate.dto';
import RoleAndJWTAuthenticationGuard from 'src/authentication/guards/role.and-jwt-authentication.guard';
import TravelRegRoles from 'src/roles/roles.enum';
import RequestWithUser from 'src/authentication/requestWithUser.interface';
import JwtAuthenticationGuard from 'src/authentication/guards/jwt-authentication.guard';
import { EmanifestPaginationParams, EmanifestPaginationParamsAdmin } from 'src/utils/paginationParams';

@Controller('emanifest')
@ApiTags('Emanifest')
export class EmanifestController {
  constructor(private readonly emanifestService: EmanifestService) {}

  @Post('create')
  @UseGuards(RoleAndJWTAuthenticationGuard(TravelRegRoles.Driver))
  @ApiBearerAuth()
  async createEmanifest(@Body() createEmanifestDto: CreateEmanifestDto,@Req() request: RequestWithUser): Promise<EmanifestEntity> {
    const requestor = request.user
    return this.emanifestService.createEmanifest(requestor,createEmanifestDto);
  }


  @Get('drivers')
  @UseGuards(RoleAndJWTAuthenticationGuard(TravelRegRoles.Driver))
    @ApiOperation({ description: "Gets Emanifest(s) created by a Driver. Authorized User: All Drivers" })
    @ApiBearerAuth()
    async getPurchaseRequests(@Req() request: RequestWithUser,
        @Query() { skip, limit, order_by, order_direction,status,approved }: EmanifestPaginationParams
    ) {
      const requestor = request.user
        return await this.emanifestService.getEmanifestForDriver(requestor, skip, limit, order_by, order_direction,status,approved)
    }

  @Get('park-admin')
  @UseGuards(RoleAndJWTAuthenticationGuard(TravelRegRoles.ParkAdmin))
    @ApiOperation({ description: "Gets Emanifest(s) created within a Park. Authorized User: All Park Admins" })
    @ApiBearerAuth()
    async getEmanifestForParkAdmin(@Req() request: RequestWithUser,
        @Query() { skip, limit, order_by, order_direction,status,approved }: EmanifestPaginationParams
    ) {
      const requestor = request.user
        return await this.emanifestService.getEmanifestForParkAdmin(requestor, skip, limit, order_by, order_direction,status,approved)
    }

  @Get('area-admin')
  @UseGuards(RoleAndJWTAuthenticationGuard(TravelRegRoles.SubAdmin))
    @ApiOperation({ description: "Gets Emanifest(s) created within an area. Authorized User: All Area Admins" })
    @ApiBearerAuth()
    async getEmanifestForSubAdmin(@Req() request: RequestWithUser,
        @Query() { skip, limit, order_by, order_direction,status,approved }: EmanifestPaginationParams
    ) {
      const requestor = request.user
        return await this.emanifestService.getEmanifestForSubAdmin(requestor, skip, limit, order_by, order_direction,status,approved)
    }

  @Get('admin')
  @UseGuards(RoleAndJWTAuthenticationGuard(TravelRegRoles.Admin))
    @ApiOperation({ description: "Gets Emanifest(s) based on query parameters. Authorized User: All Admins" })
    @ApiBearerAuth()
    async getEmanifestForAdmin(@Req() request: RequestWithUser,
        @Query() {driverId,parkId,areaId, skip, limit, order_by, order_direction,status,approved }: EmanifestPaginationParamsAdmin
    ) {
      const requestor = request.user
        return await this.emanifestService.getEmanifestForAdmin(driverId,parkId,areaId,skip, limit, order_by, order_direction,status,approved)
    }

  @Get('metrics')
  @UseGuards(RoleAndJWTAuthenticationGuard(TravelRegRoles.Admin))
    @ApiOperation({ description: "Gets Trip metrics. Authorized User: All Admins" })
    @ApiBearerAuth()
    async getTripMetrics(@Req() request: RequestWithUser,
    ) {
        return await this.emanifestService.getTripMetrics()
    }

    @Get(':driverId')
    @UseGuards(JwtAuthenticationGuard)
    @ApiOperation({ description: "Gets Emanifest(s) created by a Driver using the driverId" })
    @ApiBearerAuth()
    async getEmanifestForByDriverId(@Param('driverId') driverId: string, @Req() request: RequestWithUser,
        @Query() { skip, limit, order_by, order_direction,status,approved }: EmanifestPaginationParams
    ) {
        return await this.emanifestService.getEmanifestForByDriverId(driverId, skip, limit, order_by, order_direction,status,approved)
    }
   
    @Get('single-manifest/:id')
    @UseGuards(JwtAuthenticationGuard)
    @ApiBearerAuth()
    async getEmanifestById(@Param('id', ParseIntPipe) id: string): Promise<EmanifestEntity> {
      const emanifest = await this.emanifestService.getEmanifestById(id);
      if (!emanifest) {
        throw new NotFoundException(`Emanifest with ID ${id} not found`);
      }
      return emanifest;
    }
 
  @Patch(':id/update-in-transit')
  @UseGuards(RoleAndJWTAuthenticationGuard(TravelRegRoles.Driver))
  @ApiBearerAuth()
  async updateManifestInTransit(@Param('id') id: string, @Body() updateManifestDto: UpdateManifestStartCordinateDto,@Req() request: RequestWithUser): Promise<void> {
    const requestor = request.user
    return await this.emanifestService.updateManifestInTransit(requestor,id, updateManifestDto);
  }

  @Patch(':id/update-location')
  @UseGuards(RoleAndJWTAuthenticationGuard(TravelRegRoles.Driver))
  @ApiBearerAuth()
  async updateLocation(@Param('id') id: string, @Body() updateLocationDto: UpdateLocationDto,@Req() request: RequestWithUser): Promise<void> {
    const requestor = request.user
    await this.emanifestService.updateLocation(requestor,id, updateLocationDto.newCoordinates);
  }

  @Patch(':id/complete')
  @UseGuards(RoleAndJWTAuthenticationGuard(TravelRegRoles.Driver))
  @ApiBearerAuth()
  async completeManifest(@Param('id') id: string, @Body() completeManifestDto: UpdateManifestEndCordinateDto,@Req() request: RequestWithUser): Promise<void> {
    const requestor = request.user
    return await this.emanifestService.completeManifest(requestor,id, completeManifestDto);
  }

  @Patch(':id/approve-reject')
  @UseGuards(RoleAndJWTAuthenticationGuard(TravelRegRoles.ParkAdmin))
  @ApiBearerAuth()
  async updateApproval(@Param('id') id: string, @Body() updateApprovalDto: UpdateApprovalDto,@Req() request: RequestWithUser): Promise<EmanifestEntity> {
    const requestor = request.user
    return await this.emanifestService.updateApproval(requestor,id, updateApprovalDto);
  }

  @Get(':driverId/distance')
  @UseGuards(JwtAuthenticationGuard)
    @ApiOperation({ description: "Gets the total distance covered by a driver in km." })
    @ApiBearerAuth()
    async getTotalDistanceCoveredByDriver(@Param('id') driverId: string,@Req() request: RequestWithUser,
    ) {
      const requestor = request.user
        return await this.emanifestService.getTotalDistanceCoveredByDriver(driverId)
    }

  @Get(':driverId/time')
  @UseGuards(JwtAuthenticationGuard)
    @ApiOperation({ description: "Gets the total hours completed by a driver in hrs." })
    @ApiBearerAuth()
    async getTotalHoursCompletedByDriver(@Param('id') driverId: string,@Req() request: RequestWithUser,
    ) {
      const requestor = request.user
        return await this.emanifestService.getTotalHoursCompletedByDriver(driverId)
    }

  @Get(':driverId/passengers')
  @UseGuards(JwtAuthenticationGuard)
    @ApiOperation({ description: "Gets the total number of passengers transported by a driver." })
    @ApiBearerAuth()
    async getTotalPasssengersTransportedByDriver(@Param('id') driverId: string,@Req() request: RequestWithUser,
    ) {
      const requestor = request.user
        return await this.emanifestService.getTotalPasssengersTransportedByDriver(driverId)
    }

  @Get(':driverId/trips')
  @UseGuards(JwtAuthenticationGuard)
    @ApiOperation({ description: "Gets the total trips completed by a driver." })
    @ApiBearerAuth()
    async getTotalTripsCompletedByDriver(@Param('id') driverId: string,@Req() request: RequestWithUser,
    ) {
      const requestor = request.user
        return await this.emanifestService.getTotalTripsCompletedByDriver(driverId)
    }

}