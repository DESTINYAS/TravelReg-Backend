/* eslint-disable prettier/prettier */
import {MaxLength } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class Area {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  @MaxLength(100)
  public title: string;

}

export default Area;
