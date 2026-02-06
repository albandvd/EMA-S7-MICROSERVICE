import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { SavesService } from './saves.service';
import { CreateSaveDto } from './dto/create-save.dto';
import { UpdateSaveDto } from './dto/update-save.dto';
import { isAuthenticated } from './auth';

@Controller('saves')
export class SavesController {
  constructor(private readonly savesService: SavesService) {}

  @Post()
  create(@Body() createSaveDto: CreateSaveDto, @Req() req: Request) {
    if (!isAuthenticated(req)) {
      console.log(req.cookies);
      throw new Error('Unauthorized');
    }
    return this.savesService.create(createSaveDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    if (!isAuthenticated(req)) {
      throw new Error('Unauthorized');
    }
    return this.savesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSaveDto: UpdateSaveDto,
    @Req() req: Request,
  ) {
    if (!isAuthenticated(req)) {
      throw new Error('Unauthorized');
    }
    return this.savesService.update(+id, updateSaveDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    if (!isAuthenticated(req)) {
      throw new Error('Unauthorized');
    }
    return this.savesService.remove(+id);
  }
}
