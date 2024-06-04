/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import User from './entities/user.entity'
import { UsersService } from './users.service'
import { UsersController } from './users.controller';
import { ConfirmationCodeModule } from '../confirmationCode/confirmationCode.module'
import { ConfirmationCodeService } from '../confirmationCode/confirmationCodeService'
import ConfirmationCode from '../confirmationCode/entities/confirmationCode.entity'
import { TwilioService } from 'src/sms/twilio.service'
import { FilesModule } from 'src/files/files.module'
import AreaService from 'src/area/area.service'
import { AreaModule } from 'src/area/area.module'
import Area from 'src/area/entities/area.entity'
import IdCard from './entities/idcard.entity'
import { ParkModule } from 'src/park/park.module'
import ParkService from 'src/park/park.service'
import Park from 'src/park/entities/park.entity'
import { UserCreatedByController } from './userCreatedBy.controller'
import { EmanifestService } from 'src/emanifest/emanifest.service'
import { EManifestModule } from 'src/emanifest/emanifest.module'
import  EmanifestEntity  from 'src/emanifest/entities/emanifest.entity'
import { WebsocketModule } from 'src/websocket/websocket.module'
import { WebsocketGateway } from 'src/websocket/websocket.gateway'


@Module({
    imports: [
        TypeOrmModule.forFeature([User, ConfirmationCode,Area,IdCard,Park,EmanifestEntity]),
        ConfigModule, ConfirmationCodeModule,FilesModule,AreaModule,ParkModule,EManifestModule,WebsocketModule],
    controllers: [UsersController,UserCreatedByController],
    providers: [UsersService, ConfirmationCodeService,TwilioService,AreaService,ParkService,EmanifestService,WebsocketGateway],
    exports: [UsersService] // allowing it to be used outside this module
})
export class UserModule { }