import { Module } from '@nestjs/common';
import { SavesService } from './saves.service';
import { SavesController } from './saves.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Saves, SavesSchema } from './schemas/saves.schema';

@Module({
  controllers: [SavesController, ],
  providers: [SavesService],
  imports: [
    MongooseModule.forFeature([
      { name: Saves.name, schema: SavesSchema },
    ]),
  ],
})
export class SavesModule {}
