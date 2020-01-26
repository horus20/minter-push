import { ApiProperty } from '@nestjs/swagger';

export class WalletDto {
  @ApiProperty()
  readonly params: string;

  @ApiProperty()
  readonly mxaddress: string;

  @ApiProperty()
  readonly balances: string;

  @ApiProperty()
  readonly status: number;
}
