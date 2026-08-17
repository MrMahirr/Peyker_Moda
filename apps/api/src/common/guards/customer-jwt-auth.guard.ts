import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class CustomerJwtAuthGuard extends AuthGuard('jwt-customer') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}

@Injectable()
export class OptionalCustomerJwtAuthGuard extends AuthGuard('jwt-customer') {
  handleRequest(err: any, user: any, info: any) {
    // Hata fırlatma, token yoksa veya geçersizse user tanımsız kalır
    return user;
  }
}
