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
  Headers,
  Put,
} from '@nestjs/common';

import { AuthenticationService } from './authentication.service';
import { LocalAuthenticationGuard } from './guards/localAuthentication.guard';
import RegisterDto from './dto/register.dto';
import RequestWithUser from './requestWithUser.interface';
import JwtAuthenticationGuard from './guards/jwt-authentication.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import LoginDTO from './dto/login.dto';
import { ForbiddenException } from '@nestjs/common';
import BoostaGenericHeader from '../utils/generic.header';
import ForgotPasswordDTO from './dto/forgot-password.dto';
import { SendConfirmPhoneNumber } from '../confirmationCode/dto/resendConfirmPhone.dto';
import { ConfirmPassword } from '../confirmationCode/dto/confirmPhone.dto';

@Controller('')
@ApiTags("Authentication")
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
  ) { }

  // @UseGuards(JwtAuthenticationGuard)
  // @Get("me")
  // @ApiBearerAuth()
  // authenticatedMe(@Req() request: RequestWithUser) {
  //   const user = request.user;
  //   user.hashedPassword = undefined;
  //   return user;
  // }

  // @Post("register")
  // async register(
  //   @Body() registrationData: RegisterDto,
  //   @Req() request: RequestWithUser,
  //   @Headers() headers: BoostaGenericHeader,
  // ) {
  //   const adminSignUpToken: string = headers.adminsignuptoken;
  //   const newUser = await this.authenticationService.register(
  //     registrationData,
  //     request.user,
  //     adminSignUpToken,
  //   );
  //   return {
  //     access_token: this.authenticationService.getBearerToken(newUser.id),newUser
  //   };
  //   // return newUser;
  // }

  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @ApiBody({
    type: LoginDTO,
  })

  @Post("log-in")
  @ApiOperation({ description: "The endpoint logs the user in by creating a bearer token for the user. Note, only active users are able to logged." })
  async login(@Req() request: RequestWithUser) {
    const user = request.user;
    const role = user.role
    return {
      access_token: this.authenticationService.getBearerToken(user.id),user
    };
  }

  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @ApiBody({
    type: LoginDTO,
  })
  
  @Post("log-in-admin")
  @ApiOperation({ description: "The endpoint logs the admin in by creating a bearer token for the admin. Note, only active adminusers are able to logged" })
  async loginA(@Req() request: RequestWithUser) {
    const user = request.user;
    const role = user.role
    if(role !== 'Admin'){throw new ForbiddenException ('You are not allowed to use this resource.')}
    return {
      access_token: this.authenticationService.getBearerToken(user.id),user
    };
  }

  // @HttpCode(200)
  // @UseGuards(LocalAuthenticationGuard)
  // @ApiBody({
  //   type: LoginDTO,
  // })
  
  

  // @HttpCode(200)
  // @ApiBody({
  //   type: ForgotPasswordDTO,
  // })
  // @Post("request-password-change")
  // @ApiOperation({ description: "The endpoint allows non-logged in users request a change in their password. They will be sent a confirmation code to their registered phone number. Note, if the phone number does not exist in the database, the endpoint still returns a 200 status code." })
  // async forgotPassword(@Body() dataIn: ForgotPasswordDTO) {
  //   const message = await this.authenticationService.requestPasswordReset(dataIn.phoneNumber);
  //   return {
  //     "message": message
  //   };
  // }

  // @Post('resend-reset-password-confirmation-code')
  // @HttpCode(200)
  // @ApiOperation({ description: "The endpoint allows user requests the confirmation code be resent to them. They can only do this after the last code's expiring minutes has elapsed. Note, if the phone number does not exist in the database, the endpoint still returns a 200 status code." })
  // async resendPasswordChangePhoneConfirmationCode(@Body() dataIn: SendConfirmPhoneNumber) {
  //   const message = await this.authenticationService.resendRequestPasswordConfirmationCode(dataIn.phoneNumber)
  //   return {
  //     message
  //   }
  // }


  // @Put('reset-password-with-code')
  // @HttpCode(200)
  // async verifyPhone(@Body() confirmPassword: ConfirmPassword) {
  //   await this.authenticationService.updatePasswordWithCode(confirmPassword.code.toString(), confirmPassword.password, confirmPassword.passwordConfirmation)
  //   return {
  //     "message": `Your password has been changed.`
  //   }
  // }

}
