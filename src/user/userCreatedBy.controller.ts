/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */



import {
    Body,
    Req,
    Controller,
    HttpCode,
    Post,
    UseGuards,
    Get,
    Param,
    Query,
    Delete,
    Put,
    Patch,
    Headers,
    UseInterceptors,
    BadRequestException,
    UploadedFile,
    StreamableFile,
    Res,
  } from '@nestjs/common';
  
  import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
  import CreateUserDto from './dto/createUser.dto';
  import { UsersService } from './users.service';
  import RoleAndJWTAuthenticationGuard from '../authentication/guards/role.and-jwt-authentication.guard';
  import TravelRegRoles from '../roles/roles.enum';
  import RequestWithUser from '../authentication/requestWithUser.interface';
  import { PaginationParams } from '../utils/paginationParams';
  import FindOneParams from '../utils/findOneParams';
  import { Response } from 'express';
  import JwtAuthenticationGuard from '../authentication/guards/jwt-authentication.guard';
  import PasswordDto, { UpdatePasswordLocked } from './dto/password.dto';
  
  import ConfirmPhone from '../confirmationCode/dto/confirmPhone.dto';
  import { ConfirmationCodeService } from '../confirmationCode/confirmationCodeService';
  import { ForbiddenAPIResponse, UnauthorizedRequestAPIResponse } from '../utils/http.errors';
  import { hashPassword } from '../utils';
  import ResendConfirmPhoneCode from '../confirmationCode/dto/resendConfirmPhone.dto';
  import IsActiveWithJWTAuthenticationGuard from '../authentication/guards/isActiveAuthentication.guard';
  import { ConfigService } from '@nestjs/config';
  import { FileInterceptor } from '@nestjs/platform-express';
  import UploadFileDTO from './dto/uploadFile.dto';
  import UpdateAreaAdminDTO from './dto/UpdateAreaAdmin.dto';
  import { FileService } from 'src/files/file.service';
  import UpdateParkAdminDTO from './dto/updateParkSubAdmin.dto';
  
  @ApiTags("User/Park")
  @ApiResponse(ForbiddenAPIResponse)
  @ApiResponse(ForbiddenAPIResponse)
  @ApiResponse(UnauthorizedRequestAPIResponse)
  @Controller("user")
  export class UserCreatedByController {
    constructor(
        private readonly usersService: UsersService
  
    ) {
    }
  
    @Get('/admin')
    @UseGuards(JwtAuthenticationGuard)
    @ApiBearerAuth()
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
    async getAllUsersCreatedBy(@Query() { skip, limit }: PaginationParams,@Req() request: RequestWithUser) {
        const requestor = request.user
        return await this.usersService.getByCreator(requestor,skip, limit)
    }
  
    @Get(':id/park-drivers')
    @UseGuards(RoleAndJWTAuthenticationGuard(TravelRegRoles.SubAdmin))
    @ApiBearerAuth()
    @ApiParam({
        name: 'id',
        description: 'Park Admin ID',
    })
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
    async getDriversByParkAdmin(@Query() { skip, limit }: PaginationParams,@Param() { id }: FindOneParams,@Req() request: RequestWithUser) {
        const requestor = request.user
        return await this.usersService.getDriversByParkAdmin(id,requestor,skip, limit)
    }

    @Get(':id/users/created')
    @UseGuards(RoleAndJWTAuthenticationGuard(TravelRegRoles.Admin))
    @ApiBearerAuth()
    @ApiParam({
        name: 'id',
        description: 'Park Admin ID',
    })
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
    async getDriversByParkAgetAllUsersCreatedByIddmin(@Query() { skip, limit }: PaginationParams,@Param() { id }: FindOneParams) {
        return await this.usersService.getAllUsersCreatedById(id,skip, limit)
    }
  
  }
  