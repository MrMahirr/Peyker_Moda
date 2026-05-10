import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class CustomerJwtAuthGuard extends AuthGuard('jwt-customer') {
    canActivate(context: ExecutionContext) {
        return super.canActivate(context);
    }
}
