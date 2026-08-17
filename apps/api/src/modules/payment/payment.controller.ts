import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Payment')
@Controller('payments')
@ApiBearerAuth()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('initialize')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Initialize payment for an order' })
  @ApiResponse({ status: 200, description: 'Payment initialized successfully' })
  async initializePayment(@Body() body: any, @Req() req: any) {
    try {
      const { orderId, cardInfo } = body;
      const user = req.user;
      const ip = req.ip;

      return await this.paymentService.initializePayment(
        orderId,
        cardInfo,
        ip,
        user,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Payment initialization failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('callback')
  @ApiOperation({ summary: 'Handle payment callback (3D Secure return)' })
  @ApiResponse({ status: 200, description: 'Callback processed' })
  async handleCallback(@Body() body: any) {
    try {
      // Simulate validation or log if needed
      return await this.paymentService.processCallback(body);
    } catch (error) {
      throw new HttpException(
        error.message || 'Payment callback failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
