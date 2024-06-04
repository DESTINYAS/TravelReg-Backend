/* eslint-disable prettier/prettier */
import {MaxLength } from 'class-validator';
import Area from 'src/area/entities/area.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class Park {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  @MaxLength(100)
  public title: string;

  @Column()
  @MaxLength(200)
  public address: string;

  @ManyToOne(() => Area, { nullable: true, eager: true })
  @JoinColumn()
  public area?: Area;

}

export default Park;
