/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';

import User from './entities/user.entity'
import CreateUserDto from './dto/createUser.dto'
import DuplicateResourceException from '../exceptions/duplicateResource.exception'
import BoostaNotFoundException from '../exceptions/notFoundExceptions';
import BoostaForbiddenException from '../exceptions/forbidden.exception';
import { ConfirmationCodeService, invalidConfirmationCodeException } from '../confirmationCode/confirmationCodeService';
import ConfirmationCodeTypes from '../confirmationCode/entities/confirmationCodeTypes';
import { confirmationCodeSentToRegisteredUserMessage } from '../utils/http.errors';
import { hashPassword, verifyPassword } from '../utils';
import { ConfigService } from '@nestjs/config';
import { FileService } from 'src/files/file.service';
import LocalFile from 'src/files/entities/localfile.entity';
import TravelRegRoles from 'src/roles/roles.enum';
import AreaService from 'src/area/area.service';
import IdCard from './entities/idcard.entity';
import ParkService from 'src/park/park.service';
import { EmanifestService } from 'src/emanifest/emanifest.service';
import Area from 'src/area/entities/area.entity';
// import IdCard from './entities/idcard.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(IdCard)
    private idCardRepository: Repository<IdCard>,
    private readonly confirmationCodeService: ConfirmationCodeService,
    private readonly configService: ConfigService,
    private readonly filesService: FileService,
    private areaService: AreaService,
    private parkService: ParkService,
    private readonly emanifestService: EmanifestService,
  ) { }


  async verifyPhoneFromCode(phoneNumber: string, code: string) {
    await this.confirmationCodeService.throwExceptionIfNotValid(code)
    const confirmationCodeData = await this.confirmationCodeService.getConfirmationCode(code)
    if (confirmationCodeData) {
      this.confirmationCodeService.markUsed(confirmationCodeData.id)
      try {
        return await this.markPhoneNumberVerified(phoneNumber)
      } catch (error) { }
    }

    throw invalidConfirmationCodeException
  }

  async resendConfirmationCode(originalPhoneNumber: string, newPhoneNumber: string, confirmationType: ConfirmationCodeTypes = ConfirmationCodeTypes.PHONE_NUMBER): Promise<void> {
    const userSaved = await this.getByPhoneNumber(originalPhoneNumber)
    const oldConfirmationCode = await this.confirmationCodeService.getConfirmationCodeByPhoneNumber(originalPhoneNumber, confirmationType)

    if (newPhoneNumber != userSaved.phoneNumber)
      await this.updatePhoneNumber(userSaved.id, newPhoneNumber)

    const newConfirmationCode = await this.confirmationCodeService.regenerateConfirmationCodeIfExpired({
      ...userSaved, phoneNumber: newPhoneNumber
    }, oldConfirmationCode.value)

    this.confirmationCodeService.sendConfirmationCode(newConfirmationCode)
  }
  /**
   * A method that sets the user active
   * @param user The user to set active
   */
  private async setUserActive(user: User) {
    user.isActive = true
    const userUpdateResponse = await this.usersRepository.update(user.id, user)
    if (!userUpdateResponse.affected) throw new BadRequestException("The server is unable to activate your account.")
  }


  /**
   * A method that sets the user active
   * @param user The user to set active
   */
   async activateUser(user: User) {
    if(user.isActive==true){return "User is already active"}
    user.isActive = true
    const userUpdateResponse = await this.usersRepository.update(user.id, user)
    if(userUpdateResponse){return "User Activated"}
    if (!userUpdateResponse) throw new BadRequestException("The server is unable to activate your account.")
  }

  /**
   * A method that sets the user active
   * @param user The user to set active
   */
   async deActivateUser(user: User) {
    if(user.isActive==false){return "User is already inactive"}
    user.isActive = false
    const userUpdateResponse = await this.usersRepository.update(user.id, user)
    if(userUpdateResponse){return "User Deactivated"}
    if (!userUpdateResponse) throw new BadRequestException("The server is unable to activate your account.")
  }


  /**
   * A method that marks the phone number of the user verified.
   * @param phoneNumber The phone number of the user to verify
   * @returns User
   */
  async markPhoneNumberVerified(phoneNumber: string) {
    const user = await this.getByPhoneNumber(phoneNumber)
    if (user) {
      await this.setUserActive(user)
      
      // TODO: needs test
      return await this.usersRepository.findOneBy({ id: user.id })
    }

    throw new BoostaNotFoundException("User", phoneNumber, "Phone Number")
  }

  /**
   * A method that updates the phone number of the given user
   * @param userID The user ID to update
   * @param newPhoneNumber The new number to edit to
   * @returns User
   */
  async updatePhoneNumber(userID: string, newPhoneNumber: string) {
    const user = await this.getById(userID)
    await this.usersRepository.update(userID, {
      ...user, phoneNumber: newPhoneNumber
    })
    return await this.getById(userID)
  }

  /**
   * A method that updates the phone number of the given user
   * @param userID The user ID to update
   * @returns User
   */
  async markPhoneVerified(userID: string) {
    const user = await this.getById(userID)
    // const profile = await this.profileRepository.findOne({ where: { user: user } })
    // if (profile) {
    //   this.profileRepository.update(profile.id, { isPhoneVerified: true })
    //   return
    // }

    throw new BadRequestException("The server is unable to update the user's profile")
  }

  /**
   * A method that updates the phone number of the given user
   * @param userID The user ID to update
   * @returns User
   */
  async markUserOnBoarded(userID: string) {
    const user = await this.getById(userID)
    // const profile = await this.profileRepository.findOne({ where: { user: user } })
    // if (profile) {
    //   this.profileRepository.update(profile.id, { isOnboarded: true })
    //   return
    // }

    throw new BadRequestException("The server is unable to update the user's profile")
  }

  /**
   * A method that gets the user with the specified phone number. A 404 exception is thrown
   * if the user does not exist.
   * @param phoneNumber The phone number of the user to retrieve the record for
   * @returns The user that corresponds to the given phone number.
   */
  async getByPhoneNumber(phoneNumber: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { phoneNumber: phoneNumber } })
    if (user) return user;

    throw new BoostaNotFoundException('User', phoneNumber, "phone number")
  }

  /**
   * A method that creates a new user across the services. The function emits the new data
   * across all supported services of the product.
   * @param userData The data of the user to create.
   * @param hashedPassword The hash version of the plain password.
   * @param requestor The user requesting for user creation.
   * @returns The created user database record and the their profile.
   */
  async create(userData: CreateUserDto, hashedPassword: string, requestor: User): Promise<User> {
    let existingUser: User;
    try {
      existingUser = await this.usersRepository.findOneBy({ phoneNumber: userData.phoneNumber })
    } catch (error) { }
    if (existingUser) {
      throw new DuplicateResourceException("User", userData.phoneNumber, "phone number")
    }
    if (this.canCreateRole(requestor.role, userData.role)) {
    const newUser = await this.usersRepository.create({
      ...userData, hashedPassword: hashedPassword,park:requestor.park,area:requestor.area,creatorId:requestor.id,createdBy: requestor,isActive:true
    })
    try {
    await this.usersRepository.save(newUser)
  } catch (error) {
    throw new Error(`User creation failed: ${error.message}`);
  }
    const newUserWithProfile = await this.getById(newUser.id)

    // this.queueClients.notifyAllServicesOfNewUser(newUserWithProfile)
    const confirmationCode = await this.confirmationCodeService.createConfirmationCode(newUser, ConfirmationCodeTypes.PHONE_NUMBER)
    // await this.confirmationCodeService.sendConfirmationCode(confirmationCode)

    return newUserWithProfile

  } else {
    throw new UnauthorizedException("Unauthorized to create the specified role");
  }
}
  
private canCreateRole(creatorRole: TravelRegRoles, targetRole: TravelRegRoles): boolean {
  // Implement your logic to check if the creatorRole can create the targetRole
  const roleHierarchy = {
    [TravelRegRoles.Admin]: [TravelRegRoles.Admin, TravelRegRoles.SubAdmin,TravelRegRoles.ParkAdmin,TravelRegRoles.Driver],
    [TravelRegRoles.SubAdmin]: [TravelRegRoles.ParkAdmin],
    [TravelRegRoles.ParkAdmin]: [TravelRegRoles.Driver],
    [TravelRegRoles.Driver]: [],
  };
  return roleHierarchy[creatorRole]?.includes(targetRole);}

  /**
   * A method that retrieves the user that corresponds to the given ID
   * @param id The ID of the user to retrieve from the database
   * @returns The database record of the user that was created.
   */
  async getById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (user) {
      return user;
    }
    throw new BoostaNotFoundException('User', id, 'ID');
  }

  /**
   * A method that retrieves the user that corresponds to the given ID
   * @param id The ID of the user to retrieve from the database
   * @returns The database record of the user that was created.
   */
  async getDriveWithDetailsById(id: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { id } });
   const totalDistance =await this.emanifestService.getTotalDistanceCoveredByDriver(id)
   const duration =await this.emanifestService.getTotalHoursCompletedByDriver(id)
   const passengers =await this.emanifestService.getTotalPasssengersTransportedByDriver(id)
   const trips =await this.emanifestService.getTotalTripsCompletedByDriver(id)
   const tripsCancelled =await this.emanifestService.getTotalTripsCancelleddByDriver(id)
   const manifest =await this.emanifestService.getTotalManifestByDriver(id)
   if(user.role !=TravelRegRoles.Driver){
    throw new BoostaNotFoundException('Driver', id, 'ID');
   }
    return{
      user,
      "TotalDistanceCoveredByDriver":totalDistance,
      "TotalHoursCompletedByDriver":duration,
      "TotalPasssengersTransportedByDriver":passengers,
      "SuccessfulTrips":trips,
      "UnsuccessfulTrips":tripsCancelled,
      "manifest":manifest
    }
  }


 
  /**
   * A method that retrieves the user's hash password that corresponds to the given ID
   * @param id The ID of the user to retrieve from the database
   * @returns The database record of the user that was created.
   */
  async getUserPasswordHash(id: string): Promise<any> {
    const user = (await this.usersRepository.findOne({ select: ["hashedPassword"], where: { id } }));
    if (user) {
      return user;
    }
    throw new BoostaNotFoundException('User', id, 'ID');
  }

  /**
   * A method that retrieves a paginated result of all the users that exists in the system.
   * @param skip
   * @param limit
   * @returns
   */
  async getAllUsers(skip = 0, limit = 10) {
    return await this.usersRepository.find({skip: skip, take: limit });
  }

  /**
   * A method that retrieves a paginated result of all the Sub-Admins that exists in the system.
   * @param skip
   * @param limit
   * @returns
   */
  async getAllSubAdmins(skip = 0, limit = 10) {
    return await this.usersRepository.find({  where: {
      role: TravelRegRoles.SubAdmin
    },skip: skip, take: limit });
  }
  /**
   * A method that retrieves a paginated result of all the users that exists in the system.
   * @param skip
   * @param limit
   * @returns
   */
  async getAllParkAdmins(skip = 0, limit = 10) {
    return await this.usersRepository.find({  where: {
      role: TravelRegRoles.ParkAdmin
    },skip: skip, take: limit });
  }

  /**
   * A method that retrieves a paginated result of all the users that exists in the system.
   * @param skip
   * @param limit
   * @returns
   */
  async getAllUsersCreatedById(id:string, skip = 0, limit = 10) {
    const user = await this.usersRepository.findOneById(id);
    return await this.usersRepository.find({  where: {
      creatorId: user.id
    },skip: skip, take: limit });
  }

  /**
   * A method that retrieves a paginated result of all the users that exists in the system.
   * @param skip
   * @param limit
   * @returns
   */
  async getAllDrivers(skip = 0, limit = 10) {
    return await this.usersRepository.find({  where: {
      role: TravelRegRoles.Driver
    },skip: skip, take: limit });
  }

  async getAllDriversInSystem() {
    return await this.usersRepository.find({  where: {
      role: TravelRegRoles.Driver
    }});
  }

  async uploadIdPhoto(
    userID: string,
    imageBuffer: Buffer,
    file_name: string,
    size: number,
    mimetype: string,
  ) {
    const user = await this.usersRepository.findOneById(userID);
    if (!user) throw new BoostaNotFoundException('User', userID, 'ID');

    // const bucketName = this.configService.get('S3_ID-CARD_BUCKET_NAME'); 
    const bucket_name = 'travelregid';
    const idCardFile: LocalFile = await this.filesService.uploadFile(
      imageBuffer,
      file_name,
      size,
      mimetype,
      bucket_name,
    );
    const idCard = this.idCardRepository.create({
      localFile: idCardFile,
      user: user,
    });
    await this.idCardRepository.save(idCard);
  }



  // async deleteIdCardPhoto(userID: string, IdCardId: string) {
  //   await this.getById(userID);
  //   const IdCardPhoto = await this.idCardRepository.findOne({
  //     where: { id: IdCardId },
  //   });
  //   if (!IdCardPhoto)
  //     throw new BoostaNotFoundException('IdCard Photo', IdCardId, 'ID');

  //   await this.idCardRepository.delete(IdCardPhoto.id);
  //   const localFile = await this.filesService.getLocalFile(
  //     IdCardPhoto.localFile.id,
  //   );
  //   await this.filesService.deleteFile(localFile);
  // }

  async downloadIdPhotoFromLocalFile(
    id: string,
  ): Promise<LocalFile> {
    const idCardPhoto = await this.idCardRepository.findOne({
      where: { id },
    });
    if (!idCardPhoto)
      throw new BoostaNotFoundException('idCard Photo', id, 'ID');
    return await this.filesService.getLocalFile(idCardPhoto.localFile.id);
  }
  
  /**
   * A method that tries to delete the user that corresponds to the given ID.
   * If no user is found, a 404 exception will be thrown. A super user can not be
   * deleted.
   * @param id The ID of the user to delete.
   */
  async deleteUser(id: string) {
    let existingUser: User;
    try {
      existingUser = await this.usersRepository.findOneBy({ id: id });
    } catch (error) {
      if (error instanceof BoostaNotFoundException) throw error;
    }

    // if (existingUser && existingUser.isSuperUser) {
    //   throw new BoostaForbiddenException();
    // }

    const deleteResponse = await this.usersRepository.delete({ id: id });
    if (!deleteResponse.affected) {
      throw new BoostaNotFoundException('User', id, 'ID');
    }

    // this.queueClients.notifyAllServicesOfDeletedUser(existingUser);
  }

  /**
   * A method that re-sends a new code to the user for confirmation to change their password.
   * @param phoneNumber The phone number to resend the code to, this must be the registered user's phone number
   * @returns Message that always says the code has been sent.
   */
  async requestPasswordReset(phoneNumber: string): Promise<string> {
    const user = await this.getByPhoneNumber(phoneNumber)
    const confirmationCode = await this.confirmationCodeService.createConfirmationCode(user, ConfirmationCodeTypes.PASSWORD_RESET)
    await this.confirmationCodeService.sendConfirmationCode(confirmationCode)
    return confirmationCodeSentToRegisteredUserMessage
  }

  /**
   * A method that updates the user's password, the user needs to provide the
   * existing password and their chosen password.
   * @param userID The ID of the user to retrieve from the database
   * @param existingPassword The plain existing password
   * @param password The new plain password
   * @param confirmPassword A confirmation of the new plain password
   * @returns User: the database record of the user that was created.
   */
  async updateUserPasswordLocked(userID: string, existingPassword: string, password: string, confirmPassword: string): Promise<User> {
    if (password.toLowerCase() != confirmPassword.toLowerCase()) throw new BadRequestException("The chosen password and the confirmation password must match")

    const userWithHashOnly = await this.getById(userID)

    try {
      await verifyPassword(existingPassword, userWithHashOnly.hashedPassword)
    } catch (error) {
      console.log(error)
      throw new BoostaForbiddenException("Your existing password does not match the one we have in our records.")
    }

    const newPasswordHash = await hashPassword(password, this.configService.get("NUMBER_OF_ROUNDS"))

    const response = await this.usersRepository.update(userID, {
      hashedPassword: newPasswordHash,
    });
    if (!response.affected) {
      throw new BoostaNotFoundException('User', userID, 'ID');
    }
    return await this.getById(userID);
  }

  async updatePasswordWithCode(code: string, password: string, passwordConfirmation: string) {
    const confirmationCode = await this.confirmationCodeService.getConfirmationCode(code)
    if (password.toLowerCase() != passwordConfirmation.toLowerCase()) throw new BadRequestException("The chosen password and the confirmation password must match. Enter it again")

    const user = await this.getByPhoneNumber(confirmationCode.phoneNumber)
    // console.log(user)

    await this.confirmationCodeService.throwExceptionIfNotValid(code)
    await this.confirmationCodeService.markUsed(confirmationCode.id)

    const newPasswordHash = await hashPassword(password, this.configService.get("NUMBER_OF_ROUNDS"))
    const response = await this.usersRepository.update(user.id, {
      hashedPassword: newPasswordHash,
    });
    if (!response.affected) {
      throw new BoostaNotFoundException('User', user.id, 'ID');
    }
    return user
  }

  
  async downloadSelfie(userID: string): Promise<any> {
    const user = await this.getById(userID)
    
    if (!user.selfieFile) {
      throw new BoostaNotFoundException("Selfie Image", userID, "user")
  }
        const stream = await this.filesService.downloadFile(user.selfieFile)
        return stream
}

async getSelfieFile(userID: string): Promise<any> {
    const user = await this.getById(userID)
    if (!user.selfieFile) {
      throw new BoostaNotFoundException("Selfie Image", userID, "user")
  }
        return user.selfieFile
        }
        

        async setSelfieFile(user: User, selfieFile: LocalFile) {
          const updateResponse = await this.usersRepository.update(user.id, {
            selfieFile: selfieFile,
          });
          if (!updateResponse.affected) {
            throw new BoostaNotFoundException('User', user.id, 'ID');
          }
        }
      

        async uploadSelfie(userID: string, imageBuffer: Buffer, file_name: string, size: number, mimetype: string) {
          const user = await this.getById(userID)
  
          const bucketName = this.configService.get("S3_SELFIES_BUCKET_NAME")
          const selfieFile: LocalFile = await this.filesService.uploadFile(imageBuffer, file_name, size, mimetype, bucketName)

              if (!user.selfieFile) {
                  await this.setSelfieFile(user, selfieFile)
                  return    
          }
           else {
              await this.filesService.deleteFile(selfieFile)
              throw new BadRequestException("You can not set selfie for this user again.")
          }
      }

      async updateSubAdminArea(
        id: string,
        areaID: string,
      ): Promise<User> {
        const user = await this.getById(id)
        if(user.area){
          throw new BadRequestException("User already assigned to an area.")
        }
        user.hashedPassword=undefined
        if(user.role !==TravelRegRoles.SubAdmin){
          throw new BadRequestException("You can not assign area for this user.")
        }
        const area = await this.areaService.getAreaById(areaID);
        const areaTaken = await this.usersRepository.findOne({where:{area:area}})
        if(areaTaken){throw new BadRequestException("Area already assigned to another user.") }
        await this.usersRepository.update(id, {
          area: area,
        });
        return {
          ...user,
          area: area,
        };
      }

      async updateParkAdminPark(
        id: string,
        parkID: string,
      ): Promise<User> {
        const user = await this.getById(id)
        if(user.park){
          throw new BadRequestException("User already assigned to a park.")
        }
        user.hashedPassword=undefined
        if(user.role !==TravelRegRoles.ParkAdmin){
          throw new BadRequestException("You can not assign park for this user.")
        }
        const park = await this.parkService.getParkById(parkID);
        const parkTaken = await this.usersRepository.findOne({where:{park:park}})
        if(parkTaken){throw new BadRequestException("Park already assigned to another user.") }
        await this.usersRepository.update(id, {
          park: park,
        });
        return {
          ...user,
          park: park,
        };
      }

  /**
   * A method that retrieves the users that were created by the logged in user
   * @param user The logged in user
   * @returns The database record of the users that will be returned.
   */
  async getByCreator(requestor: User,skip = 0, limit = 10): Promise<any> {
    const users = await this.usersRepository.find({ where: { creatorId:requestor.id },skip:skip,take:limit });
      return users;
  }

    /**
   * A method that retrieves the users that corresponds to the  given ID of user that created them
   * @param user The ID of the user
   * @returns The database record of the users that will be retrieved.
   */
    async getDriversByParkAdmin(id: string,requestor:User,skip = 0, limit = 10): Promise<any> {

    const userData = this.getById(id)
    if((await userData).createdBy !=requestor){
      throw new BadRequestException("User not within your jurisdiction.")
    }
      const user = await this.usersRepository.find({ where: { createdBy:userData[0]},skip:skip,take:limit });
        return user;
    }

    async updateUserNINPark(
      id: string,
      nin: string,
    ): Promise<User> {
      const user = await this.getById(id)
      user.hashedPassword=undefined
      
      await this.usersRepository.update(id, {
        nin: nin,
      });
      return {
        ...user,
        nin: nin,
      };
    }

    async getParkAdminsByArea(area: Area): Promise<User[]> {
      const parkAdmins = await this.usersRepository.find({
        where: {
          area: { id: area.id },
          role: TravelRegRoles.ParkAdmin,
        },
      });
      return parkAdmins;
    }

    //

    async getAreasWithParksAndParkAdmins(): Promise<any[]> {
      // Fetch all areas
      const areas = await this.areaService.find();
    
      // Iterate through each area to fetch its associated parks
      const areasWithParks = [];
      for (const area of areas) {
        const parks = await this.parkService.getAllParksByArea(area);
        areasWithParks.push({
          area,
          parks
        });
      }
    
      return areasWithParks;
    }
    // async getAreasWithParksAndParkAdmins(): Promise<any[]> {

    //   const areas = await this.areaService.find();
  
    //   const areasWithParksAndParkAdmins = [];
  
    //   for (const area of areas) {
    //     const parks = await this.parkService.getAllParksByArea(area);
    //     const parkAdmins = await this.getParkAdminsByArea(area);
  
    //     const parksWithAdmins = [];
    //     for (const park of parks) {
    //       const parkAdmin = parkAdmins.find(admin => admin.park?.id === park.id);
    //       const drivers = (await this.getAllUsersCreatedById(parkAdmin.id)).length;
    //       parksWithAdmins.push({
    //         park,
    //         parkAdmin,
    //         drivers,
    //       });
    //     }
  
    //     areasWithParksAndParkAdmins.push({
    //       area,
    //       parksWithAdmins,
    //     });
    //   }
    //   return areasWithParksAndParkAdmins;
    // }


    async getAllDriversWithTripCounts() {
      const allDrivers = await this.getAllDriversInSystem();
      const driversWithTripCounts = [];
      
      for (const driver of allDrivers) {
        const totalTripsCompleted = await this.emanifestService.getTotalTripsCompletedByDriver(driver.id);
        driversWithTripCounts.push({
          driver,
          totalTripsCompleted,
        });
      }
      
      return driversWithTripCounts;
    }
}


