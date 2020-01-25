import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Company } from './company.entity';

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  created: Date;

  @Column({length: 16})
  wallet: string;

  @Column({length: 42, nullable: true})
  mxaddress: string;

  @Column('int')
  status: number;

  @ManyToOne(type => Company, company => company.wallets)
  company: Company;

  @Column('text', {nullable: true})
  balances: string;

  @Column('text', {nullable: true})
  params: string;
}
