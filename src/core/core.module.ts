import { Module  } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// import { Core, Point, Event, RawPoint } from './entity';
// import { CoreRepository } from './repository';
import { CoreController } from './core.controller';
// import { CoreService } from './service';

@Module({
  // imports: [TypeOrmModule.forFeature([CoreRepository, Point, RawPoint, Event, Element])],
  controllers: [CoreController],
  // providers: [CoreService],
  // exports: [CoreService],
})
export class CoreModule {}
