import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SavesService } from './saves.service';
import { Saves } from './schemas/saves.schema';

describe('SavesService', () => {
  let service: SavesService;
  let model: any;

  // Simulation d'une instance de document Mongoose
  const mockSaveInstance = {
    save: jest.fn().mockResolvedValue({ id: 1, data: 'test' }),
  };

  // Mock du modèle Mongoose
  const mockSavesModel = jest
    .fn()
    .mockImplementation(() => mockSaveInstance) as any;

  // Ajout des méthodes statiques au mock
  mockSavesModel.findById = jest.fn();
  mockSavesModel.findByIdAndUpdate = jest.fn();
  mockSavesModel.findByIdAndDelete = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SavesService,
        {
          provide: getModelToken(Saves.name),
          useValue: mockSavesModel,
        },
      ],
    }).compile();

    service = module.get<SavesService>(SavesService);
    model = module.get(getModelToken(Saves.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('devrait appeler save() sur une nouvelle instance', async () => {
      const dto = { data: 'test' } as any;
      const result = await service.create(dto);

      expect(model).toHaveBeenCalledWith(dto);
      expect(mockSaveInstance.save).toHaveBeenCalled();
      expect(result).toEqual({ id: 1, data: 'test' });
    });
  });

  describe('findOne', () => {
    it('devrait appeler findById avec le bon ID', async () => {
      const expectedResult = { id: 123 };
      model.findById.mockResolvedValue(expectedResult);

      const result = await service.findOne(123);

      expect(model.findById).toHaveBeenCalledWith(123);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('devrait appeler findByIdAndUpdate avec l option new: true', async () => {
      const dto = { data: 'updated' };
      model.findByIdAndUpdate.mockResolvedValue({ id: 1, ...dto });

      await service.update(1, dto as any);

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(1, dto, {
        new: true,
      });
    });
  });

  describe('remove', () => {
    it('devrait appeler findByIdAndDelete', async () => {
      model.findByIdAndDelete.mockResolvedValue({ deleted: true });

      const result = await service.remove(1);

      expect(model.findByIdAndDelete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ deleted: true });
    });
  });
});
