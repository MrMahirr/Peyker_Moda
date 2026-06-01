import { Controller, Post, Body, Get, Param, Res, UseGuards, Patch, Query, BadRequestException } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, UpdateInvoiceDto, InvoiceQueryDto } from './dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import type { Response } from 'express';
import * as fs from 'fs';

@ApiTags('Invoices')
@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class InvoicesController {
    constructor(private readonly invoicesService: InvoicesService) { }

    @Post()
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Siparişten fatura oluştur' })
    async create(@Body() createInvoiceDto: CreateInvoiceDto) {
        return this.invoicesService.createFromOrder(createInvoiceDto);
    }

    @Post('return')
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'İade faturası oluştur' })
    async createReturnInvoice(@Body() body: { orderNumber: string; reason: string }) {
        if (!body.orderNumber || !body.reason) {
            throw new BadRequestException('orderNumber and reason are required');
        }
        return this.invoicesService.createReturnInvoice(body.orderNumber, body.reason);
    }

    @Get()
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Fatura listesi' })
    async findAll(@Query() query: InvoiceQueryDto) {
        return this.invoicesService.findAll(query);
    }

    @Get(':id')
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Fatura detayı' })
    async findOne(@Param('id') id: string) {
        return this.invoicesService.findOne(id);
    }

    @Patch(':id')
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Fatura durumunu güncelle' })
    async updateStatus(@Param('id') id: string, @Body() updateDto: UpdateInvoiceDto) {
        if (!updateDto.status) {
            throw new BadRequestException('status is required');
        }
        return this.invoicesService.updateStatus(id, updateDto.status);
    }

    @Get(':id/pdf')
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Fatura PDF indir' })
    async downloadPdf(@Param('id') id: string, @Res() res: Response) {
        const filePath = await this.invoicesService.getPdfPath(id);

        if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=invoice-${id}.pdf`);
            fs.createReadStream(filePath).pipe(res);
        } else {
            res.status(404).send('PDF dosyası bulunamadı');
        }
    }
}
