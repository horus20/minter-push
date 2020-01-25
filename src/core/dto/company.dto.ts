import { ApiProperty } from '@nestjs/swagger';

export class CompanyDto {
  @ApiProperty()
  readonly params: string;

  @ApiProperty()
  readonly email: string;

  @ApiProperty()
  readonly password: string;

  @ApiProperty()
  readonly status: number;
}
