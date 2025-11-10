import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './presentation/controllers/app.controller';
import { OAuthController } from './presentation/controllers/oauth.controller';
import { AppService } from './application/services/app.service';
import { GovBrPureService } from './application/services/gov-br-pure.service';

@Module({
  imports: [HttpModule],
  controllers: [AppController, OAuthController],
  providers: [AppService, GovBrPureService],
})
export class AppModule {}
