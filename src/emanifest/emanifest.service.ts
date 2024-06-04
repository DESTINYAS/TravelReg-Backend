import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import EmanifestEntity  from './entities/emanifest.entity';
import { CreateEmanifestDto, RouteDto } from './dto/createEMmanifest.dto';
import { ManifestStatus } from 'src/roles/manifestStatus';
import { UpdateApprovalDto, UpdateManifestEndCordinateDto, UpdateManifestStartCordinateDto } from './dto/updateCordinate.dto';
import { calculateDurationInMinutes } from './entities/duration-calculator';
import { calculateDistance } from './entities/distance-calculator';
import { WebsocketGateway } from 'src/websocket/websocket.gateway';
import { CoordinateDto } from './dto/cordinate.dto';
import User from 'src/user/entities/user.entity';
import { OrderDirection, Orderby } from 'src/utils/paginationParams';
import { ApprovalStatus } from 'src/roles/approveManifest';
import { plainToClass } from 'class-transformer';

@Injectable()
export class EmanifestService {
  constructor(
    @InjectRepository(EmanifestEntity)
    private readonly emanifestRepository: Repository<EmanifestEntity>,
    private readonly websocketGateway: WebsocketGateway,
  ) {}


  async createEmanifest(requestor: User,createEmanifestDto: CreateEmanifestDto): Promise<EmanifestEntity> {
    

    // Create an instance of EmanifestEntity and assign values from the DTO
    let emanifest = this.emanifestRepository.create({
        ...createEmanifestDto,
        driverId: requestor.id,
        driverName: requestor.fullName,
        plateNumber: requestor.plateNumber,
        parkId: requestor.park.id,
        areaId: requestor.park.area.id,
        departureDateTime:new Date()
    });

    // Save the entity to the database
    return this.emanifestRepository.save(emanifest);
  }

  async getEmanifestById(id: string): Promise<EmanifestEntity> {
    const emanifest = await this.emanifestRepository.findOne({where:{id}});
    if (!emanifest) {
      throw new NotFoundException(`Emanifest with ID ${id} not found`);
    }
    return emanifest;
  }

  async updateManifestInTransit(requestor: User,id: string, updateManifestDto: UpdateManifestStartCordinateDto): Promise<void> {
    const manifest = await this.emanifestRepository.findOne({ where: { id } });
    if (!manifest) {
      throw new NotFoundException(`Manifest with ID ${id} not found`);
    }

    if (manifest.driverId!=requestor.id) {
      throw new BadRequestException(`Manifest with ID ${id} was not created by you`);
    }
// if(manifest.approved != ApprovalStatus.APPROVED){
//   throw new BadRequestException(`Manifest with ID ${id} has not been approved`);
// }
    manifest.status = ManifestStatus.IN_TRANSIT;
    manifest.departureDateTime = new Date();
    manifest.startCoordinates = updateManifestDto.startCoordinates;
    manifest.currentLocation = updateManifestDto.startCoordinates;
    await this.emanifestRepository.save(manifest);
    this.websocketGateway.server.emit('manifestUpdate', manifest);
  }

  
  async completeManifest(requestor: User,id: string, completeManifestDto: UpdateManifestEndCordinateDto): Promise<void> {
    const manifest = await this.emanifestRepository.findOne({ where: { id } });
    if (!manifest) {
      throw new NotFoundException(`Manifest with ID ${id} not found`);
    }
    if (manifest.driverId!=requestor.id) {
      throw new BadRequestException(`Manifest with ID ${id} was not created by you`);
    }
// if(manifest.approved != ApprovalStatus.APPROVED){
//   throw new BadRequestException(`Manifest with ID ${id} has not been approved`);
// }
    manifest.status = ManifestStatus.COMPLETED;
    manifest.arrivalDateTime = new Date();
    manifest.endCoordinates = completeManifestDto.endCoordinates;
    manifest.currentLocation = completeManifestDto.endCoordinates;

    // Calculate duration in minutes
    if (manifest.departureDateTime) {
      manifest.durationInMinutes = calculateDurationInMinutes(manifest.departureDateTime, manifest.arrivalDateTime);
    }

    // Calculate distance in kilometers
    if (manifest.startCoordinates && manifest.endCoordinates) {
      manifest.distanceInKilometers = calculateDistance(manifest.startCoordinates, manifest.endCoordinates);
    }

    await this.emanifestRepository.save(manifest);
    this.websocketGateway.server.emit('manifestUpdate', manifest);
    
  }

  async updateLocation(requestor: User,id: string, newCoordinates: CoordinateDto): Promise<void> {
    const manifest = await this.emanifestRepository.findOne({where:{id}});

    if (manifest.driverId!=requestor.id) {
      throw new BadRequestException(`Manifest with ID ${id} was not created by you`);
    }

    if (manifest) {
      manifest.currentLocation = newCoordinates;
      await this.emanifestRepository.save(manifest);
      this.websocketGateway.server.emit('manifestUpdate', manifest);
    }}

  async updateApproval(requestor: User,id: string, updateApprovalDto: UpdateApprovalDto): Promise<EmanifestEntity> {
    const manifest = await this.emanifestRepository.findOne({ where: { id } });
    if (!manifest) {
      throw new NotFoundException(`Manifest with ID ${id} not found`);
    }
    if (manifest.parkId!=requestor.park.id) {
      throw new BadRequestException(`Manifest with ID ${id} is not within your jurisdiction`);
    }

    manifest.approved = updateApprovalDto.approvalStatus;

    return await this.emanifestRepository.save(manifest);
  }
  
  async getEmanifestForDriver(requestor: User, skip: number = 0, limit: number = 10, order_by: Orderby, order_direction: OrderDirection,status: ManifestStatus = undefined, approved: ApprovalStatus = undefined) {

    let order_info = { createdAt: order_direction }
    if (order_by == Orderby.DATE_CREATED) {
        order_info = { createdAt: order_direction }
    }

    const driverId = requestor.id

    let whereQuery = {}

    
    if (requestor != undefined) {

         whereQuery = { ...whereQuery, driverId } 
    }

    if (status != undefined) {
        whereQuery = { ...whereQuery,status }
    }

    if (approved != undefined) {
        whereQuery = { ...whereQuery,approved }
    }

    const emanifests = await this.emanifestRepository.find({ where: whereQuery, skip: skip, take: limit, order: order_info })
    const totalEmanifests = await this.emanifestRepository.count({ where: whereQuery })
    return {
        "total": totalEmanifests,
        "manifests": emanifests,
    }
}

  async getEmanifestForByDriverId(driverId: string, skip: number = 0, limit: number = 10, order_by: Orderby, order_direction: OrderDirection,status: ManifestStatus = undefined, approved: ApprovalStatus = undefined) {

    let order_info = { createdAt: order_direction }
    if (order_by == Orderby.DATE_CREATED) {
        order_info = { createdAt: order_direction }
    }

    let whereQuery = {}

    
    if (driverId != undefined) {

         whereQuery = { ...whereQuery, driverId } 
    }

    if (status != undefined) {
        whereQuery = { ...whereQuery,status }
    }

    if (approved != undefined) {
        whereQuery = { ...whereQuery,approved }
    }

    const emanifests = await this.emanifestRepository.find({ where: whereQuery, skip: skip, take: limit, order: order_info })
    const totalEmanifests = await this.emanifestRepository.count({ where: whereQuery })
    return {
        "total": totalEmanifests,
        "manifests": emanifests,
    }
}
  async getEmanifestForParkAdmin(requestor: User, skip: number = 0, limit: number = 10, order_by: Orderby, order_direction: OrderDirection,status: ManifestStatus = undefined, approved: ApprovalStatus = undefined) {

    let order_info = { createdAt: order_direction }
    if (order_by == Orderby.DATE_CREATED) {
        order_info = { createdAt: order_direction }
    }

    const parkId = requestor.park.id

    let whereQuery = {}

    
    if (requestor != undefined) {

         whereQuery = { ...whereQuery, parkId } 
    }

    if (status != undefined) {
        whereQuery = { ...whereQuery,status }
    }

    if (approved != undefined) {
        whereQuery = { ...whereQuery,approved }
    }

    const emanifests = await this.emanifestRepository.find({ where: whereQuery, skip: skip, take: limit, order: order_info })
    const totalEmanifests = await this.emanifestRepository.count({ where: whereQuery })
    return {
        "total": totalEmanifests,
        "manifests": emanifests,
    }
}
  async getEmanifestForSubAdmin(requestor: User, skip: number = 0, limit: number = 10, order_by: Orderby, order_direction: OrderDirection,status: ManifestStatus = undefined, approved: ApprovalStatus = undefined) {

    let order_info = { createdAt: order_direction }
    if (order_by == Orderby.DATE_CREATED) {
        order_info = { createdAt: order_direction }
    }

    const areaId = requestor.area.id

    let whereQuery = {}

    
    if (requestor != undefined) {

         whereQuery = { ...whereQuery, areaId } 
    }

    if (status != undefined) {
        whereQuery = { ...whereQuery,status }
    }

    if (approved != undefined) {
        whereQuery = { ...whereQuery,approved }
    }

    const emanifests = await this.emanifestRepository.find({ where: whereQuery, skip: skip, take: limit, order: order_info })
    const totalEmanifests = await this.emanifestRepository.count({ where: whereQuery })
    return {
        "total": totalEmanifests,
        "manifests": emanifests,
    }
}

  async getEmanifestForAdmin(driverId:string= undefined,areaId:string= undefined,parkId:string= undefined,skip: number = 0, limit: number = 10, order_by: Orderby, order_direction: OrderDirection,status: ManifestStatus = undefined, approved: ApprovalStatus = undefined) {

    let order_info = { createdAt: order_direction }
    if (order_by == Orderby.DATE_CREATED) {
        order_info = { createdAt: order_direction }
    }

    let whereQuery = {}

    
    if (driverId != undefined) {

         whereQuery = { ...whereQuery, driverId } 
    }
    if (parkId != undefined) {

         whereQuery = { ...whereQuery, parkId } 
    }
    if (areaId != undefined) {

         whereQuery = { ...whereQuery, areaId } 
    }

    if (status != undefined) {
        whereQuery = { ...whereQuery,status }
    }

    if (approved != undefined) {
        whereQuery = { ...whereQuery,approved }
    }

    const emanifests = await this.emanifestRepository.find({ where: whereQuery, skip: skip, take: limit, order: order_info })
    const totalEmanifests = await this.emanifestRepository.count({ where: whereQuery })
    return {
        "total": totalEmanifests,
        "manifests": emanifests,
    }
}

async getTotalDistanceCoveredByDriver(driverId:string){
const emanifest = await this.emanifestRepository.find({where:{driverId:driverId} && {status:ManifestStatus.COMPLETED}})
 let totalDistance = 0;
 for(let i=0;i<emanifest.length;i++){
  totalDistance+=Number(emanifest[i].distanceInKilometers)
 }
 return totalDistance
}

async getTotalHoursCompletedByDriver(driverId:string){
const emanifest = await this.emanifestRepository.find({where:{driverId:driverId,status:ManifestStatus.COMPLETED }})
 let duration = 0;
 for(let i=0;i<emanifest.length;i++){
  duration+=Number(emanifest[i].durationInMinutes)
 }
 duration/60 
 return duration
}

async getTotalPasssengersTransportedByDriver(driverId:string){
const emanifest = await this.emanifestRepository.find({where:{driverId:driverId,status:ManifestStatus.COMPLETED}})
 let passengers = 0;
 for(let i=0;i<emanifest.length;i++){
  passengers+=Number(emanifest[i].numberOfPassengers)
 }
 return passengers
}

async getTotalTripsCompletedByDriver(driverId:string){
const emanifest = await this.emanifestRepository.find({where:{driverId:driverId ,status:ManifestStatus.COMPLETED}})
 return emanifest.length
}

async getTotalTripsCancelleddByDriver(driverId:string){
const emanifest = await this.emanifestRepository.find({where:{driverId:driverId ,status:ManifestStatus.CANCELLED}})
 return emanifest.length
}

async getTotalManifestByDriver(driverId:string){
const emanifest = await this.emanifestRepository.find({where:{driverId:driverId}})
 return emanifest.length
}

async getTripMetrics(){
  let numberOfPassenger = 0;
  const completedTrips = await this.emanifestRepository.find({where:{status:ManifestStatus.COMPLETED}})
  const currrentTrips = await this.emanifestRepository.find({where:{status:ManifestStatus.IN_TRANSIT}})
  const pendingTrips = await this.emanifestRepository.find({where:{approved:ApprovalStatus.PROCESSING}})
 for(let i=0;i<completedTrips.length;i++){
  numberOfPassenger += Number(completedTrips[i].numberOfPassengers)
 }

return {
  completedTrips:completedTrips.length,
  currrentTrips:currrentTrips.length,
  pendingTrips:pendingTrips.length,
  numberOfPassenger:numberOfPassenger
}
  }

}