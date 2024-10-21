import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { PrismaService } from './database/prisma.service';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { EmailService } from './common/services/nodemailer.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [UserModule],
  controllers: [AppController],
  exports: [UserModule, EmailService],
  providers: [AppService, PrismaService, EmailService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
