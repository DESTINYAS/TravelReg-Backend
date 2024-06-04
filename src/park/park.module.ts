/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import  ParkService  from './park.service';
import  ParkController  from './park.controller';
import Park from './entities/park.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import AreaService from 'src/area/area.service';
import Area from 'src/area/entities/area.entity';
import { AreaModule } from 'src/area/area.module';

@Module({
  imports: [TypeOrmModule.forFeature([Park,Area])],
  controllers: [ParkController],
  providers: [ParkService,AreaService],
})
export class ParkModule {}
