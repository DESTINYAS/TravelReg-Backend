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
import UpdateAreaAdminDTO, { UpdateninAdminDTO } from './dto/UpdateAreaAdmin.dto';
import { FileService } from 'src/files/file.service';
import UpdateParkAdminDTO from './dto/updateParkSubAdmin.dto';

const NUMBER_OF_ROUNDS = 10;

@ApiTags("Users")
@ApiResponse(ForbiddenAPIResponse)
@ApiResponse(ForbiddenAPIResponse)
@ApiResponse(UnauthorizedRequestAPIResponse)
@Controller("users")
export class UsersController {
  constructor(
      private readonly usersService: UsersService,
      // private readonly configService: ConfigService,
      private readonly fileService: FileService,
      // private readonly confirmationService: ConfirmationCodeService,

  ) {
  }


  // @Put('reset-password')
  // @UseGuards(JwtAuthenticationGuard)
  // @ApiBearerAuth()
  // @ApiOperation({ description: "The endpoint resets the password of an already logged in user." })
  // async updateUserPassword(
  //     @Body() passwordDto: UpdatePasswordLocked,
  //     @Req() request: RequestWithUser,
  // ) {
  //     const id = request.user.id;
  //     await this.usersService.updateUserPasswordLocked(id, passwordDto.existingPassword, passwordDto.newPassword, passwordDto.newPasswordConfirmation)
  //     return {
  //         message: "Your password has been successfully changed"
  //     }
  // }


  @Post('')
  @UseGuards(IsActiveWithJWTAuthenticationGuard())
  @ApiBearerAuth()
  async createUser(@Body() data: CreateUserDto, @Req() request: RequestWithUser) {
      const requestor = request.user
      const hashedPassword = await hashPassword(data.password, NUMBER_OF_ROUNDS)
      const newUser = await this.usersService.create(data, hashedPassword, requestor)
      return newUser
  }

  @Get("areas-parks-admin")
  @UseGuards(RoleAndJWTAuthenticationGuard(TravelRegRoles.Admin))
  @ApiBearerAuth()
  async getAreasWithParksAndParkAdmins(
  ){
    return await this.usersService.getAreasWithParksAndParkAdmins();
  }

  @Get("driver-trip-count")
  @UseGuards(RoleAndJWTAuthenticationGuard(TravelRegRoles.Admin))
  @ApiBearerAuth()
  async getAllDriversWithTripCounts(
  ){
    return await this.usersService.getAllDriversWithTripCounts();
  }

  // TODO: Needs Test
  @Post(':id/upload-selfie')
  @ApiParam({
    name: 'id',
    description: 'ID of the user you are uploading the selfie for',
})
  @ApiConsumes("multipart/form-data")
  @ApiBearerAuth()
  @UseGuards(IsActiveWithJWTAuthenticationGuard())
  @UseInterceptors(FileInterceptor('file'))
  async uploadSelfie(@Req() request: RequestWithUser,
      @Body() uploadDto: UploadFileDTO,@Param() { id }: FindOneParams, @UploadedFile() file: Express.Multer.File) {
      if (file) {
          await this.usersService.uploadSelfie(id, file.buffer, file.originalname, file.size, file.mimetype)
      } else {
          throw new BadRequestException("No file was uploaded.")
      }
  }


  @Get(':id/download-selfie/')
  @ApiParam({
      name: 'id',
      description: 'User ID to get the selfie for',
  })
  async downloadSelfie(@Res() response: Response, @Param() { id }: FindOneParams) {
      const localFile = await this.usersService.getSelfieFile(id)
      const stream = await this.usersService.downloadSelfie(id)
      if (!stream) {
          throw new BadRequestException("File is empty!")
      }
      stream.pipe(response)
      return new StreamableFile(stream);
  }

  @Post(':id/upload-id-card')
  @ApiParam({
    name: 'id',
    description: 'ID of the user you are uploading the id Card for',
})
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @UseGuards(IsActiveWithJWTAuthenticationGuard())
  @UseInterceptors(FileInterceptor('file'))
  async uploadIdPhoto(
    @Req() request: RequestWithUser,
    @Param() { id }: FindOneParams,
    @Body() uploadDto: UploadFileDTO,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      await this.usersService.uploadIdPhoto(
        id,
        file.buffer,
        file.originalname,
        file.size,
        file.mimetype,
      );
    } else {
      throw new BadRequestException('No file was uploaded.');
    }
  }


//   // TODO: Needs Test
//   @Delete(':userID/delete-id-card/:id')
//   @ApiBearerAuth()
//   @UseGuards(JwtAuthenticationGuard)
//   @ApiParam({
//     name: 'id',
//     description: 'The File ID to delete',
//   })
//   @ApiParam({
//     name: 'userID',
//     description: 'The user id',
//   })
//   @ApiOperation({
//     description:
//       'Deletes the specified id Card photo.',
//   })
//   async deleteIdCardPhoto(
//     @Param() { id }: FindOneParams,
//     @Param() { userID },
//   ) {
//     await this.usersService.deleteIdCardPhoto(userID, id);
//     return {
//       "message": "id card Photo deleted"
//     }
//   }

  // TODO: Needs Test
  @Get('download-id-card/:id')
  @ApiParam({
    name: 'id',
    description: 'id card Photo ID you want to download',
  })
  async downloadIdPhotoFromLocalFile(
    @Res() response: Response,
    @Param() { id }: FindOneParams,
  ) {
    const localFile = await this.usersService.downloadIdPhotoFromLocalFile(
      id,
    );
    const stream = await this.fileService.downloadFile(localFile);
    if (!stream) {
      throw new BadRequestException('File is empty!');
    }
    stream.pipe(response);
    return new StreamableFile(stream);
  }


  @Get('')
  @UseGuards(IsActiveWithJWTAuthenticationGuard())
  @UseGuards(RoleAndJWTAuthenticationGuard(TravelRegRoles.Admin))
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
  async getAllUsers(@Query() { skip, limit }: PaginationParams) {
      return await this.usersService.getAllUsers(skip, limit)
  }

  @Get('sub-admins')
  @UseGuards(IsActiveWithJWTAuthenticationGuard())
  @UseGuards(RoleAndJWTAuthenticationGuard(TravelRegRoles.Admin))
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
  async getAllSubAdmins(@Query() { skip, limit }: PaginationParams) {
      return await this.usersService.getAllSubAdmins(skip, limit)
  }

  @Get('park-admins')
  @UseGuards(IsActiveWithJWTAuthenticationGuard())
  @UseGuards(RoleAndJWTAuthenticationGuard(TravelRegRoles.Admin))
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
  async getAllParkAdmins(@Query() { skip, limit }: PaginationParams) {
      return await this.usersService.getAllParkAdmins(skip, limit)
  }

  @Get('drivers')
  @UseGuards(IsActiveWithJWTAuthenticationGuard())
  @UseGuards(RoleAndJWTAuthenticationGuard(TravelRegRoles.Admin))
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
  async getAllDrivers(@Query() { skip, limit }: PaginationParams) {
      return await this.usersService.getAllDrivers(skip, limit)
  }

// @Patch(':id/admin-activate-user')
//   @ApiParam({
//       name: 'id',
//       description: 'User ID',
//   })
//   @UseGuards(IsActiveWithJWTAuthenticationGuard())
//   @UseGuards(JwtAuthenticationGuard)
//   @ApiBearerAuth()
//   @ApiOperation({ description: "Activate the specified user. Only an admin can perform this action." })
//   @UseGuards(RoleAndJWTAuthenticationGuard(TravelRegRoles.Admin))
//   async activateUser(@Param() { id }: FindOneParams) {
//       const user = await this.usersService.getById((id))
//       await this.usersService.activateUser(user)
//       return {
//           "message": "User activated"
//       }
//   }

// @Patch(':id/admin-deactivate-user')
//   @ApiParam({
//       name: 'id',
//       description: 'User ID',
//   })
//   @UseGuards(IsActiveWithJWTAuthenticationGuard())
//   @UseGuards(JwtAuthenticationGuard)
//   @ApiBearerAuth()
//   @ApiOperation({ description: "Deactivate the specified user. Only an admin can perform this action." })
//   @UseGuards(RoleAndJWTAuthenticationGuard(TravelRegRoles.Admin))
//   async deActivateUser(@Param() { id }: FindOneParams) {
//       const user = await this.usersService.getById((id))
//       await this.usersService.deActivateUser(user)
//       return {
//           "message": "User Deactivated"
//       }
//   }

// @Patch(':id/sub-admin-activate-user')
//   @ApiParam({
//       name: 'id',
//       description: 'User ID',
//   })
//   @UseGuards(IsActiveWithJWTAuthenticationGuard())
//   @ApiBearerAuth()
//   @ApiOperation({ description: "Activate the specified user. Only a sub-admin can perform this action." })
//   @UseGuards(RoleAndJWTAuthenticationGuard(TravelRegRoles.SubAdmin))
//   async activateUsersubAdmin(@Param() { id }: FindOneParams) {
//       const user = await this.usersService.getById((id))
//       await this.usersService.activateUser(user)
//       return {
//           "message": "User activated"
//       }
//   }

// @Patch(':id/sub-admin-deactivate-user')
//   @ApiParam({
//       name: 'id',
//       description: 'User ID',
//   })
//   @UseGuards(IsActiveWithJWTAuthenticationGuard())
//   @ApiBearerAuth()
//   @ApiOperation({ description: "Deactivate the specified user. Only an admin can perform this action." })
//   @UseGuards(RoleAndJWTAuthenticationGuard(TravelRegRoles.SubAdmin))
//   async deActivateUserSubAdmin(@Param() { id }: FindOneParams) {
//       const user = await this.usersService.getById((id))
//       await this.usersService.deActivateUser(user)
//       return {
//           "message": "User Deactivated"
//       }
//   }

  @Get(':id')
  @ApiParam({
      name: 'id',
      description: 'User ID',
  })
  @UseGuards(IsActiveWithJWTAuthenticationGuard())
  @ApiBearerAuth()
  async getUser(@Param() { id }: FindOneParams,) {
      return this.usersService.getById((id))
  }

  @Get(':id/driver-with-details')
  @ApiParam({
      name: 'id',
      description: 'Driver ID',
  })
  @UseGuards(IsActiveWithJWTAuthenticationGuard())
  @ApiBearerAuth()
  async getDriveWithDetailsById(@Param() { id }: FindOneParams) {
      return this.usersService.getDriveWithDetailsById((id))
  }

  @Put('/:id/sub-admin-area')
  @ApiBearerAuth()
  @UseGuards(RoleAndJWTAuthenticationGuard(TravelRegRoles.Admin))
  @ApiParam({
    name: 'id',
    description: 'The user ID.',
  })
  @ApiOperation({
    description:
      'Updates the area of the Sub-admin',
  })
  async updateSubAdminArea(
    @Param() { id }: FindOneParams,
    @Body() data: UpdateAreaAdminDTO,
  ) {
    return await this.usersService.updateSubAdminArea(
      id,
      data.areaID,
    );
  }

  @Put('/:id/park-admin-park')
  @ApiBearerAuth()
  @UseGuards(RoleAndJWTAuthenticationGuard(TravelRegRoles.SubAdmin))
  @ApiParam({
    name: 'id',
    description: 'The user ID.',
  })
  @ApiOperation({
    description:
      'Updates the area of the Sub-admin',
  })
  async updateParkAdminArea(
    @Param() { id }: FindOneParams,
    @Body() data: UpdateParkAdminDTO,
  ) {
    return await this.usersService.updateParkAdminPark(
      id,
      data.parkID,
    );
  }

  // @Get('with-admin-access/:id')
  // @ApiParam({
  //     name: 'id',
  //     description: 'User ID',
  // })
  // async getUserWithAdminAccess(@Param() { id }: FindOneParams, @Headers() headers: BoostaGenericHeader,) {
  //     const adminSignUpToken: string = headers.adminsignuptoken;
  //     if (adminSignUpToken != this.configService.get('ADMIN_SIGN_UP_TOKEN'))
  //         throw new ForbiddenException(
  //             'You can only register as a Merchant or an Agent',
  //         );

  //     return this.usersService.getById((id))
  // }


  // @Put('/:id/nin')
  // @ApiBearerAuth()
  // @UseGuards(RoleAndJWTAuthenticationGuard(TravelRegRoles.Admin))
  // @ApiParam({
  //   name: 'id',
  //   description: 'The user ID.',
  // })
  // @ApiOperation({
  //   description:
  //     'Updates the area of the Sub-admin',
  // })
  // async updateUserNINPark(
  //   @Param() { id }: FindOneParams,
  //   @Body() data: UpdateninAdminDTO,
  // ) {
  //   return await this.usersService.updateUserNINPark(
  //     id,
  //     data.nin,
  //   );
  // }


  // @Delete(':id')
  // @ApiParam({
  //     name: 'id',
  //     description: 'User ID',
  // })
  // @UseGuards(JwtAuthenticationGuard)
  // @ApiBearerAuth()
  // @UseGuards(RoleAndJWTAuthenticationGuard(TravelRegRoles.Admin))
  // async deleteUser(@Param() { id }: FindOneParams) {
  //     return this.usersService.deleteUser((id))
  // }

  // @Patch(':id/verify-user')
  // @ApiParam({
  //     name: 'id',
  //     description: 'User ID',
  // })
  // @UseGuards(JwtAuthenticationGuard)
  // @ApiBearerAuth()
  // @ApiOperation({ description: "Manually verify the specified user. Only an admin can perform this action." })
  // @UseGuards(RoleAndJWTAuthenticationGuard(TravelRegRoles.Admin))
  // async verifyUser(@Param() { id }: FindOneParams) {
  //     const user = await this.usersService.getById((id))
  //     await this.usersService.markPhoneNumberVerified(user.phoneNumber)
  //     return {
  //         "message": "User verified"
  //     }
  // }

  // @Post('verify-phone')
  // @HttpCode(200)
  // async verifyPhone(@Body() confirmPhone: ConfirmPhone) {
  //     await this.usersService.verifyPhoneFromCode(confirmPhone.phoneNumber, confirmPhone.code.toString())
  //     return {
  //         "message": `Your account is now active.`
  //     }
  // }

  // @Post('send-confirmation-code')
  // @HttpCode(200)
  // @ApiOperation({ description: 'The endpoint sends a new confirmation code to the user only if the expiry time has passed. A user can change their phone number by supplying a different phone number in the newPhoneNumber field' })
  // async resendVerifyPhoneConfirmationCode(@Body() dataIn: ResendConfirmPhoneCode) {
  //     await this.usersService.resendConfirmationCode(dataIn.originalPhoneNumber, dataIn.newPhoneNumber)
  //     return {
  //         "message": `A  confirmation code has been sent to ${dataIn.newPhoneNumber}`
  //     }
  // }

}
