import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OAuthController } from './presentation/controllers/oauth.controller';
import { GovBrPureService } from './application/services/gov-br-pure.service';

@Module({
  imports: [HttpModule],
  controllers: [OAuthController],
  providers: [GovBrPureService],
})
export class AppModule {}
