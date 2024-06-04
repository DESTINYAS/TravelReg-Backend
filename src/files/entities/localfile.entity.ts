/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export default class LocalFile {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column()
    public mimetype: string

    @Column({ nullable: true })
    public bucket_name: string

    @Column()
    public size: number

    @Column()
    public original_file_name: string

    @Column({ default: '' })
    public file_name: string
}