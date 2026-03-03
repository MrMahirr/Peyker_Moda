import { Controller, Post, Body, Get, Param, Res, UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { UserRole } from '@prisma/client';
import type { Response } from 'express';
import * as fs from 'fs';

@ApiTags('Invoices')
@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class InvoicesController {
    constructor(private readonly invoicesService: InvoicesService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @ApiOperation({ summary: 'Siparişten fatura oluştur' })
    async create(@Body() createInvoiceDto: CreateInvoiceDto) {
        return this.invoicesService.createFromOrder(createInvoiceDto);
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @ApiOperation({ summary: 'Fatura detayı' })
    async findOne(@Param('id') id: string) {
        return this.invoicesService.findOne(id);
    }

    @Get(':id/pdf')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
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
