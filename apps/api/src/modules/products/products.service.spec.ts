import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ProductsService', () => {
    let service: ProductsService;
    let prisma: PrismaService;

    const mockProduct = {
        id: 'product-id-1',
        name: 'Test Ürün',
        slug: 'test-urun',
        description: 'Test açıklama',
        sku: 'SKU001',
        barcode: '1234567890',
        price: 100,
        compareAtPrice: 150,
        stock: 50,
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
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductsService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<ProductsService>(ProductsService);
        prisma = module.get<PrismaService>(PrismaService);

        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return paginated products', async () => {
            const products = [mockProduct];
            mockPrismaService.product.findMany.mockResolvedValue(products);
            mockPrismaService.product.count.mockResolvedValue(1);

            const result = await service.findAll({ page: 1, limit: 10 });

            expect(result.data).toEqual(products);
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

    describe('findById', () => {
        it('should return product when found', async () => {
            mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

            const result = await service.findById('product-id-1');

            expect(result).toEqual(mockProduct);
        });

        it('should return null when product not found', async () => {
            mockPrismaService.product.findUnique.mockResolvedValue(null);

            const result = await service.findById('non-existent-id');

            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should create a new product', async () => {
            const createDto = {
                name: 'Yeni Ürün',
                sku: 'SKU002',
                price: 200,
                categoryId: 'category-id-1',
            };
            mockPrismaService.product.create.mockResolvedValue({ ...mockProduct, ...createDto });

            const result = await service.create(createDto);

            expect(result.name).toBe('Yeni Ürün');
            expect(mockPrismaService.product.create).toHaveBeenCalled();
        });
    });

    describe('update', () => {
        it('should update an existing product', async () => {
            const updateDto = { name: 'Güncellenmiş Ürün' };
            mockPrismaService.product.update.mockResolvedValue({ ...mockProduct, ...updateDto });

            const result = await service.update('product-id-1', updateDto);

            expect(result.name).toBe('Güncellenmiş Ürün');
        });
    });

    describe('delete', () => {
        it('should delete a product', async () => {
            mockPrismaService.product.delete.mockResolvedValue(mockProduct);

            await service.remove('product-id-1');

            expect(mockPrismaService.product.delete).toHaveBeenCalledWith({
                where: { id: 'product-id-1' },
            });
        });
    });
});
