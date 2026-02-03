import { Injectable } from '@nestjs/common';
import { CreateSaveDto } from './dto/create-save.dto';
import { UpdateSaveDto } from './dto/update-save.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Saves } from './schemas/saves.schema';
import { Model } from 'mongoose';

@Injectable()
export class SavesService {
  @InjectModel(Saves.name) private savesModel: Model<Saves>

  async create(createSaveDto: CreateSaveDto) {
    const createdSave = new this.savesModel(createSaveDto);
    return createdSave.save();
  }

  async findOne(id: number) {
    return this.savesModel.findById(id);
  }

  async update(id: number, updateSaveDto: UpdateSaveDto) {
    return this.savesModel.findByIdAndUpdate(id, updateSaveDto, { new: true });
  }

  async remove(id: number) {
    return this.savesModel.findByIdAndDelete(id);
  }
}
