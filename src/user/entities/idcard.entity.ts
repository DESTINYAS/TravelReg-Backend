import { Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm'

import LocalFile from '../../files/entities/localfile.entity';
import User from './user.entity';

@Entity()
export default class IdCard {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @JoinColumn()
    @OneToOne((type => LocalFile), { eager: true, cascade: false })
    public localFile: LocalFile

    @ManyToOne(() => User, (user: User) => user.idCards, { eager: false, cascade: false })
    @JoinTable()
    public user: User;

}