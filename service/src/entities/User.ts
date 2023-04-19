import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @CreateDateColumn()
  create_time: Date

  @Column('varchar')
  name: string

  @Column('varchar')
  password: string

  @Column('int')
  gpt_times: number
}
