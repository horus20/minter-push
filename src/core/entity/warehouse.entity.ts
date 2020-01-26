import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
export class Warehouse {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Exclude()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  created: Date;

  @Column({length: 42, nullable: true})
  mxaddress: string;

  @Exclude()
  @Column('text')
  seed: string;

  @Exclude()
  @Column('text', {nullable: true})
  balances: string;

  getBalances() {
    return JSON.parse(this.balances ?? '{}');
  }

  setBalances(balances) {
    this.balances = JSON.stringify(balances ?? {});
  }
}
