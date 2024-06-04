import { Module } from '@nestjs/common';
import { EmanifestService } from './emanifest.service';
import { EmanifestController } from './emanifest.controller';
import  EmanifestEntity  from './entities/emanifest.entity';
import User from 'src/user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebsocketModule } from 'src/websocket/websocket.module';
import { WebsocketGateway } from 'src/websocket/websocket.gateway';
import { PdfGenerationController } from './pdf-generation.controller';
import { PdfGenerationService } from './pdf-generation.service';

@Module({
  imports: [TypeOrmModule.forFeature([EmanifestEntity,User,WebsocketModule])],
  controllers: [EmanifestController,PdfGenerationController],
  providers: [EmanifestService,WebsocketGateway,PdfGenerationService],
})
export class EManifestModule {}
