import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Warehouse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  created: Date;

  @Column({length: 42, nullable: true})
  mxaddress: string;

  @Column('text')
  seed: string;

  @Column('text', {nullable: true})
  balances: string;
}
