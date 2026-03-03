import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { CustomerGroupsService } from './customer-groups.service';
import { CreateCustomerGroupDto, UpdateCustomerGroupDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { UserRole } from '@prisma/client';

@ApiTags('Customer Groups')
@Controller('customer-groups')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class CustomerGroupsController {
    constructor(private readonly customerGroupsService: CustomerGroupsService) { }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @ApiOperation({ summary: 'Müşteri grupları listesi' })
    @ApiResponse({ status: 200, description: 'Grup listesi döner' })
    async findAll() {
        return this.customerGroupsService.findAll();
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @ApiOperation({ summary: 'Grup detayı' })
    @ApiResponse({ status: 200, description: 'Grup bulundu' })
    @ApiResponse({ status: 404, description: 'Grup bulunamadı' })
    async findOne(@Param('id') id: string) {
        return this.customerGroupsService.findOne(id);
    }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @ApiOperation({ summary: 'Yeni grup oluştur' })
    @ApiResponse({ status: 201, description: 'Grup oluşturuldu' })
    async create(@Body() createCustomerGroupDto: CreateCustomerGroupDto) {
        return this.customerGroupsService.create(createCustomerGroupDto);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @ApiOperation({ summary: 'Grup güncelle' })
    @ApiResponse({ status: 200, description: 'Grup güncellendi' })
    async update(
        @Param('id') id: string,
        @Body() updateCustomerGroupDto: UpdateCustomerGroupDto,
    ) {
        return this.customerGroupsService.update(id, updateCustomerGroupDto);
    }

    @Post(':id/customers/:customerId')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @ApiOperation({ summary: 'Gruba müşteri ekle' })
    async addCustomer(
        @Param('id') groupId: string,
        @Param('customerId') customerId: string,
    ) {
        return this.customerGroupsService.addCustomer(groupId, customerId);
    }

    @Delete(':id/customers/:customerId')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @ApiOperation({ summary: 'Gruptan müşteri çıkar' })
    async removeCustomer(@Param('customerId') customerId: string) {
        return this.customerGroupsService.removeCustomer(customerId);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Grup sil' })
    @ApiResponse({ status: 200, description: 'Grup silindi' })
    async remove(@Param('id') id: string) {
        return this.customerGroupsService.remove(id);
    }
}
