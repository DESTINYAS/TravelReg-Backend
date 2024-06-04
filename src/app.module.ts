/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfirmationCodeModule } from './confirmationCode/confirmationCode.module';
import { SafeTripModule } from './safe-trip/safe-trip.module';
import { EManifestModule } from './emanifest/emanifest.module';
import { SmsModule } from './sms/sms.module';
import { FilesModule } from './files/files.module';
import { UserModule } from './user/users.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AreaModule } from './area/area.module';
import { ParkModule } from './park/park.module';

@Module({
  imports: [ConfigModule.forRoot ({}),DatabaseModule,EManifestModule,UserModule,FilesModule, SmsModule, EManifestModule, SafeTripModule, ConfirmationCodeModule, AuthenticationModule, AreaModule, ParkModule],
  controllers: [],
  providers: [],
  exports: []
})
export class AppModule {}
