import { Test, TestingModule } from '@nestjs/testing';
import { SavesController } from './saves.controller';
import { SavesService } from './saves.service';
import { isAuthenticated } from './auth';

// On mock la fonction d'authentification
jest.mock('./auth', () => ({
  isAuthenticated: jest.fn(),
}));

describe('SavesController', () => {
  let controller: SavesController;
  let service: SavesService;

  const mockSavesService = {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockRequest = { cookies: {} } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SavesController],
      providers: [
        {
          provide: SavesService,
          useValue: mockSavesService,
        },
      ],
    }).compile();

    controller = module.get<SavesController>(SavesController);
    service = module.get<SavesService>(SavesService);

    // Reset des mocks avant chaque test
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('devrait créer une sauvegarde si authentifié', async () => {
      const dto = { data: 'test' } as any;
      (isAuthenticated as jest.Mock).mockReturnValue(true);
      mockSavesService.create.mockReturnValue('saved');

      expect(await controller.create(dto, mockRequest)).toBe('saved');
      expect(service.create).toHaveBeenCalledWith(dto);
    });

    it('devrait lever une erreur si non authentifié', async () => {
      (isAuthenticated as jest.Mock).mockReturnValue(false);

      expect(() => controller.create({} as any, mockRequest)).toThrow(
        'Unauthorized',
      );
    });
  });

  describe('findOne', () => {
    it('devrait retourner une sauvegarde par ID', async () => {
      (isAuthenticated as jest.Mock).mockReturnValue(true);
      mockSavesService.findOne.mockReturnValue({ id: 1 });

      expect(await controller.findOne('1', mockRequest)).toEqual({ id: 1 });
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('devrait échouer si non authentifié', async () => {
      (isAuthenticated as jest.Mock).mockReturnValue(false);
      expect(() => controller.findOne('1', mockRequest)).toThrow(
        'Unauthorized',
      );
    });
  });

  describe('update', () => {
    it('devrait mettre à jour si authentifié', async () => {
      const dto = { data: 'updated' } as any;
      (isAuthenticated as jest.Mock).mockReturnValue(true);
      mockSavesService.update.mockReturnValue(true);

      await controller.update('1', dto, mockRequest);
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('devrait supprimer si authentifié', async () => {
      (isAuthenticated as jest.Mock).mockReturnValue(true);
      mockSavesService.remove.mockReturnValue(true);

      await controller.remove('1', mockRequest);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
