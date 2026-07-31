import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, Roles } from '../../common/decorators';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import {
  ApproveReturnDto,
  CompleteReturnDto,
  CreateReturnDto,
  RefundReturnDto,
  RejectReturnDto,
  ReturnQueryDto,
} from './dto';
import { ReturnsService } from './returns.service';

@ApiTags('Returns')
@Controller('returns')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Get()
  @Roles('admin', 'manager', 'staff')
  @ApiOperation({ summary: 'Return request list' })
  @ApiResponse({ status: 200, description: 'Return list response' })
  async findAll(@Query() query: ReturnQueryDto) {
    return this.returnsService.findAll(query);
  }

  @Get(':id')
  @Roles('admin', 'manager', 'staff')
  @ApiOperation({ summary: 'Return request detail' })
  async findOne(@Param('id') id: string) {
    return this.returnsService.findOne(id);
  }

  @Post()
  @Roles('admin', 'manager', 'staff')
  @ApiOperation({ summary: 'Create an admin/POS return request' })
  @ApiResponse({ status: 201, description: 'Return request created' })
  async create(
    @Body() createReturnDto: CreateReturnDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.returnsService.create(createReturnDto, userId);
  }

  @Patch(':id/approve')
  @Roles('admin', 'manager', 'staff')
  @ApiOperation({ summary: 'Approve a return request' })
  async approve(
    @Param('id') id: string,
    @Body() approveReturnDto: ApproveReturnDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.returnsService.approve(id, approveReturnDto, userId);
  }

  @Patch(':id/reject')
  @Roles('admin', 'manager', 'staff')
  @ApiOperation({ summary: 'Reject a return request' })
  async reject(
    @Param('id') id: string,
    @Body() rejectReturnDto: RejectReturnDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.returnsService.reject(id, rejectReturnDto, userId);
  }

  @Post(':id/refund')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Record refund and complete a return' })
  async refund(
    @Param('id') id: string,
    @Body() refundReturnDto: RefundReturnDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.returnsService.refund(id, refundReturnDto, userId);
  }

  @Patch(':id/complete')
  @Roles('admin', 'manager', 'staff')
  @ApiOperation({ summary: 'Complete return stock/order updates' })
  async complete(
    @Param('id') id: string,
    @Body() completeReturnDto: CompleteReturnDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.returnsService.complete(id, completeReturnDto, userId);
  }
}
