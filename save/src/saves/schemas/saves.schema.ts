
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SavesDocument = HydratedDocument<Saves>;

@Schema()
export class Saves {
  @Prop()
  userId: string;

  @Prop()
  hero: {"id": string, "name": string, "class": string, "hp": number, "atk": number, "res": number, "speed": number, "gold": number, "inventory": string[]};

  @Prop()
  dungeonId: string;

  @Prop()
  currentRoomIndex: number;

  @Prop()
  status: string;
}

export const SavesSchema = SchemaFactory.createForClass(Saves);
