import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [UsersModule, AuthModule],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
