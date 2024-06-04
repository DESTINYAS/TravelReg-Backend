/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import  CreateParkDto  from './dto/create-park.dto';
import { UpdateParkDto } from './dto/update-park.dto';
import { Repository } from 'typeorm';
import Park from './entities/park.entity';
import { InjectRepository } from '@nestjs/typeorm';
import AreaService from 'src/area/area.service';
import BoostaNotFoundException from 'src/exceptions/notFoundExceptions';
import Area from 'src/area/entities/area.entity';

@Injectable()
export default class ParkService {
  constructor(
    @InjectRepository(Park)
    private parkRepository: Repository<Park>,
    private areaService: AreaService,
  ) { }


   /**
   * The method creates a new area with the title and state specified. If a title already exists, it throws an error
   * @param parkDTO New Park Data
   * @returns The new Park created
   */
   async createPark(parkDTO: CreateParkDto) {
    // await this.throwErrorIfExist(parkDTO.title);
    const area = await this.areaService.getAreaById(parkDTO.areaId)
    if(!area){throw new BoostaNotFoundException("Park",parkDTO.areaId) }
    const newPark = this.parkRepository.create({ title:parkDTO.title ,address:parkDTO.address, area:area});
    await this.parkRepository.save(newPark);
    return newPark;
  }

 /**
   *
   * TODO: Pagination and Order By
   * @returns A list of all the arrays
   */
 async getAllParks(skip: number = 0, limit: number = 10) {
  return this.parkRepository.find({ skip: skip, take: limit });
}

 /**
   * A method that fetches the park that matches the specified ID
   * @param id The ID of the park to fetch.
   * @returns The park that matches this ID
   */
 async getParkById(id: string) {
  const park = await this.parkRepository.findOne({ where: { id: id } });
  if (park) {
    return park;
  }
  throw new BoostaNotFoundException('Park', id);
}

async getAllParksByArea(area: Area) {
  const parks = await this.parkRepository.findBy({
    area: { id: area.id },
  });
  return parks;
}

async find(): Promise<Park[]> {
  return this.parkRepository.find();
}
}
