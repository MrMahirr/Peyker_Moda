import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockProduct = {
    id: 'product-id-1',
    name: 'Test Product',
    slug: 'test-product',
    description: 'Test description',
    sku: 'SKU001',
    barcode: '1234567890',
    price: 100,
    basePrice: 100,
    compareAtPrice: 150,
    stock: 50,
    images: [
      { id: 'media-id-1', url: 'https://example.com/product.jpg', alt: 'Test' },
    ],
    variants: [
      {
        id: 'variant-id-1',
        sku: 'SKU001-S',
        stock: 50,
        size: 'S',
        color: 'Black',
        price: 100,
      },
    ],
    lowStockThreshold: 10,
    isActive: true,
    categoryId: 'category-id-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    media: {
      findMany: jest.fn(),
    },
  };

  const mockUploadService = {
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: UploadService, useValue: mockUploadService },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([mockProduct]);
      mockPrismaService.product.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual([
        expect.objectContaining({
          ...mockProduct,
          totalStock: 50,
          primaryImage: 'https://example.com/product.jpg',
        }),
      ]);
      expect(result.meta.total).toBe(1);
      expect(mockPrismaService.product.findMany).toHaveBeenCalled();
    });

    it('should filter by category when provided', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await service.findAll({ categoryId: 'category-id-1' });

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId: 'category-id-1',
          }),
        }),
      );
    });

    it('should filter by search term when provided', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await service.findAll({ search: 'test' });

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return product when found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findOne('product-id-1');

      expect(result).toEqual(
        expect.objectContaining({
          ...mockProduct,
          totalStock: 50,
        }),
      );
    });

    it('should throw when product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        'Ürün bulunamadı',
      );
    });
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createDto = {
        name: 'New Product',
        sku: 'SKU002',
        price: 200,
        categoryId: 'category-id-1',
      };
      mockPrismaService.product.findUnique.mockResolvedValue(null);
      mockPrismaService.product.create.mockResolvedValue({
        ...mockProduct,
        ...createDto,
      });

      const result = await service.create(createDto);

      expect(result.name).toBe('New Product');
      expect(mockPrismaService.product.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an existing product', async () => {
      const updateDto = { name: 'Updated Product' };
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.findFirst.mockResolvedValue(null);
      mockPrismaService.product.update.mockResolvedValue({
        ...mockProduct,
        ...updateDto,
      });

      const result = await service.update('product-id-1', updateDto);

      expect(result.name).toBe('Updated Product');
    });
  });

  describe('remove', () => {
    it('should soft delete a product', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.update.mockResolvedValue({
        ...mockProduct,
        isActive: false,
      });

      const result = await service.remove('product-id-1');

      expect(result).toEqual({ message: 'Ürün başarıyla silindi' });
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 'product-id-1' },
        data: { isActive: false },
      });
    });
  });
});
