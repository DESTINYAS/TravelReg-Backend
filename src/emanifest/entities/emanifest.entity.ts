import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { calculateDistance } from './distance-calculator'; // Import the distance calculator
import { calculateDurationInMinutes } from './duration-calculator';
import { ManifestStatus } from 'src/roles/manifestStatus';
import { ApprovalStatus } from 'src/roles/approveManifest';
import { CoordinateDto } from '../dto/cordinate.dto';

@Entity()
 class EmanifestEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb', nullable:true}) // Use JSONB type for route
  route: object; // Use the Route object

  @Column({nullable:false})
  numberOfPassengers: number;

  @Column({ type: 'jsonb' ,nullable:false})
  passengers: any[];

  @Column({type:'uuid',nullable: false})
  driverId: string;

  @Column({type:'uuid',nullable: false})
  parkId: string;

  @Column({type:'uuid',nullable: false})
  areaId: string;

  @Column({nullable: false})
  driverName: string;

  @Column({nullable: true})
  plateNumber: string;

  // @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  // dateCreated: Date;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP(6)',
})
public createdAt: Date;

  @Column({ type: 'timestamp' ,nullable:true})
  departureDateTime: Date;

  @Column({ type: 'timestamp', nullable: true})
  arrivalDateTime: Date;

  @Column({ type: 'enum', enum: ManifestStatus, default: ManifestStatus.PROCESSING }) // Status enum
  status: ManifestStatus;

  @Column({ type: 'enum', enum: ApprovalStatus, default: ApprovalStatus.PROCESSING }) // Approval status enum
  approved: ApprovalStatus;

  @Column({ type: 'integer', nullable: true }) // Duration in minutes
  durationInMinutes: number | null;

  @Column({ type: 'jsonb', nullable: true })
  startCoordinates: CoordinateDto; // Start coordinates

  @Column({ type: 'jsonb', nullable: true })
  endCoordinates: CoordinateDto; // End coordinates

  @Column({ type: 'jsonb', nullable: true }) // Adjust the type as needed
  currentLocation: CoordinateDto;

  // Method to calculate duration between departure and arrival datetime
  calculateDuration(): void {
    try {
      this.durationInMinutes = calculateDurationInMinutes(this.departureDateTime, this.arrivalDateTime);
    } catch (error) {
      console.log('Departure or arrival datetime is missing');
      this.durationInMinutes= null;
    }}
  
  @Column({ type: 'float', nullable: true }) // Distance in kilometers
  distanceInKilometers: number | null;

  // Method to calculate distance between start and end points of the route
  calculateDistance(): void {
    try {
      this.distanceInKilometers = calculateDistance(this.startCoordinates, this.endCoordinates);
    } catch (error) {
      // throw new Error(`Failed to calculate distance: ${error.message}`);
      console.log(`Failed to calculate distance: ${error.message}`)
      this.distanceInKilometers=null
    }

}
}

export default  EmanifestEntity