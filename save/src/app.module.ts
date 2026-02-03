import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SavesModule } from './saves/saves.module';

@Module({
  imports: [MongooseModule.forRoot('mongodb://itemuser:itempassword@save-db:27017/nest'), SavesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
