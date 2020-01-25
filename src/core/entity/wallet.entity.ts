import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Company } from './company.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Wallet {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Exclude()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  created: Date;

  @Column({length: 16})
  wallet: string;

  @Exclude()
  @Column({length: 42, nullable: true})
  mxaddress: string;

  @Column('int')
  status: number;

  @Exclude()
  @ManyToOne(type => Company, company => company.wallets)
  company: Company;

  @Exclude()
  @Column('text', {nullable: true})
  balances: string;

  @Exclude()
  @Column('text', {nullable: true})
  params: string;
}
