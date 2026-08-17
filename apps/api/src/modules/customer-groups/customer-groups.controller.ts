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

@ApiTags('Customer Groups')
@Controller('customer-groups')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class CustomerGroupsController {
  constructor(private readonly customerGroupsService: CustomerGroupsService) {}

  @Get()
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Müşteri grupları listesi' })
  @ApiResponse({ status: 200, description: 'Grup listesi döner' })
  async findAll() {
    return this.customerGroupsService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Grup detayı' })
  @ApiResponse({ status: 200, description: 'Grup bulundu' })
  @ApiResponse({ status: 404, description: 'Grup bulunamadı' })
  async findOne(@Param('id') id: string) {
    return this.customerGroupsService.findOne(id);
  }

  @Post()
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Yeni grup oluştur' })
  @ApiResponse({ status: 201, description: 'Grup oluşturuldu' })
  async create(@Body() createCustomerGroupDto: CreateCustomerGroupDto) {
    return this.customerGroupsService.create(createCustomerGroupDto);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Grup güncelle' })
  @ApiResponse({ status: 200, description: 'Grup güncellendi' })
  async update(
    @Param('id') id: string,
    @Body() updateCustomerGroupDto: UpdateCustomerGroupDto,
  ) {
    return this.customerGroupsService.update(id, updateCustomerGroupDto);
  }

  @Post(':id/customers/:customerId')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Gruba müşteri ekle' })
  async addCustomer(
    @Param('id') groupId: string,
    @Param('customerId') customerId: string,
  ) {
    return this.customerGroupsService.addCustomer(groupId, customerId);
  }

  @Delete(':id/customers/:customerId')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Gruptan müşteri çıkar' })
  async removeCustomer(@Param('customerId') customerId: string) {
    return this.customerGroupsService.removeCustomer(customerId);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Grup sil' })
  @ApiResponse({ status: 200, description: 'Grup silindi' })
  async remove(@Param('id') id: string) {
    return this.customerGroupsService.remove(id);
  }
}
