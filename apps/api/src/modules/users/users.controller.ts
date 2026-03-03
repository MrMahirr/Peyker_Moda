import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { UserRole } from '@prisma/client';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @ApiOperation({ summary: 'Kullanıcı listesi' })
    @ApiResponse({ status: 200, description: 'Kullanıcı listesi döner' })
    async findAll(@Query() query: UserQueryDto) {
        return this.usersService.findAll(query);
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @ApiOperation({ summary: 'Kullanıcı detayı' })
    @ApiResponse({ status: 200, description: 'Kullanıcı bulundu' })
    @ApiResponse({ status: 404, description: 'Kullanıcı bulunamadı' })
    async findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Post()
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Yeni kullanıcı oluştur' })
    @ApiResponse({ status: 201, description: 'Kullanıcı oluşturuldu' })
    @ApiResponse({ status: 409, description: 'Email zaten kullanılıyor' })
    async create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @ApiOperation({ summary: 'Kullanıcı güncelle' })
    @ApiResponse({ status: 200, description: 'Kullanıcı güncellendi' })
    @ApiResponse({ status: 404, description: 'Kullanıcı bulunamadı' })
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Kullanıcı sil' })
    @ApiResponse({ status: 200, description: 'Kullanıcı silindi' })
    @ApiResponse({ status: 404, description: 'Kullanıcı bulunamadı' })
    async remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}
