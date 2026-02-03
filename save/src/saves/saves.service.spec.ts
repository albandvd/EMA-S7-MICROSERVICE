import { Test, TestingModule } from '@nestjs/testing';
import { SavesController } from './saves.controller';
import { SavesService } from './saves.service';
import { CreateSaveDto } from './dto/create-save.dto';
import { UpdateSaveDto } from './dto/update-save.dto';

describe('SavesController', () => {
  let controller: SavesController;
  let service: SavesService;

  const mockSavesService = {
    create: jest.fn((dto) => {
      return { id: 1, ...dto };
    }),
    findOne: jest.fn((id) => {
      return { id, name: 'Test Save' };
    }),
    update: jest.fn((id, dto) => {
      return { id, ...dto };
    }),
    remove: jest.fn((id) => {
      return { id, deleted: true };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SavesController],
      providers: [
        {
          provide: SavesService,
          useValue: mockSavesService, // On injecte notre mock ici
        },
      ],
    }).compile();

    controller = module.get<SavesController>(SavesController);
    service = module.get<SavesService>(SavesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new save', async () => {
      const createSaveDto: CreateSaveDto = { name: 'New Save', data: {} } as any; // Adaptez selon votre DTO réel
      
      const result = await controller.create(createSaveDto);

      expect(service.create).toHaveBeenCalledWith(createSaveDto);
      expect(result).toEqual({ id: 1, ...createSaveDto });
    });
  });

  describe('findOne', () => {
    it('should find one save by id and convert param to number', async () => {
      const idStr = '1';
      const result = await controller.findOne(idStr);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1, name: 'Test Save' });
    });
  });

  describe('update', () => {
    it('should update a save', async () => {
      const idStr = '1';
      const updateSaveDto: UpdateSaveDto = { name: 'Updated Save' } as any;

      const result = await controller.update(idStr, updateSaveDto);

      expect(service.update).toHaveBeenCalledWith(1, updateSaveDto);
      expect(result).toEqual({ id: 1, ...updateSaveDto });
    });
  });

  describe('remove', () => {
    it('should remove a save', async () => {
      const idStr = '1';
      const result = await controller.remove(idStr);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1, deleted: true });
    });
  });
});