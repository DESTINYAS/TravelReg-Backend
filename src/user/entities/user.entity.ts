/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Exclude } from 'class-transformer';
import TravelRegRoles from '../../roles/roles.enum';
import Gender from '../../roles/gender.enum'
import LocalFile from 'src/files/entities/localfile.entity';
import Park from 'src/park/entities/park.entity';
import Area from 'src/area/entities/area.entity';
import IdCard from './idcard.entity';

@Entity()
class User {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column({
        unique: true
    })
    public phoneNumber: string


    @Column()
    public fullName: string

    @Column({
        unique: true
    })
    public nin: string

    @Column()
    public age: string

    @Column({
        type: 'enum',
        enum: Gender,
    })
    public gender: Gender

    @Column()
    public maritalStatus: string

    @Column()
    public drivExperience: string


    @Column()
    @Exclude()
    public hashedPassword: string;


    @Column({ nullable: true })
    public plateNumber: string;

    @Column({ unique:true,nullable: true })
    public email: string;

    @Column({ nullable: true })
    public creatorId: string;

    @ManyToOne(() => Area, { nullable: true, eager: true })
    @JoinColumn()
    public area?: Area;

    @ManyToOne(() => Park, { nullable: true, eager: true })
    @JoinColumn()
    public park?: Park;

    @JoinColumn()
    @OneToOne(() => LocalFile, { nullable: true, eager: true })
    public selfieFile?: LocalFile;

    @Column({
        default: false
    })
    public isActive: boolean


    @Column({ nullable: true })
    homeAddress: string;

    @Column({ nullable: true })
    guarantorName: string;
  
    @Column({ nullable: true })
    guarantorAddress: string;
  
    @Column({ nullable: true })
    guarantorPhoneNumber: string;

    @Column({
        type: 'enum',
        enum: TravelRegRoles,
        default: TravelRegRoles.Driver
    })
    public role: TravelRegRoles

    @ManyToOne(type => User)
    public createdBy: User;


    @OneToMany(() => IdCard, (photo: IdCard) => photo.user, {
        eager: true,
        cascade: false,
      })
      public idCards?: IdCard[];

    @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP(6)" })
    public createdAt: Date;

    @UpdateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updatedAt: Date;
}

export default User;