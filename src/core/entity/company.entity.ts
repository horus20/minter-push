import { BeforeUpdate, Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Wallet } from './wallet.entity';
import { Warehouse } from './warehouse.entity';

@Entity()
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  created: Date;

  @Exclude()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  updated: Date;

  @Column('text', {nullable: true})
  params: string;

  @Column({length: 512, nullable: true})
  email: string;

  @Exclude()
  @Column({length: 64, nullable: true})
  password: string;

  @OneToOne(type => Warehouse)
  @JoinColumn()
  warehouseWallet: Warehouse;

  @Column('int')
  status: number;

  @BeforeUpdate()
  updateTimestamp() {
    this.updated = new Date();
  }

  @OneToMany(type => Wallet, wallet => wallet.company)
  @JoinColumn()
  wallets: Wallet[];

  getParams() {
    return JSON.parse(this.params);
  }

  setParams(params) {
    this.params = JSON.stringify(params);
  }
}
