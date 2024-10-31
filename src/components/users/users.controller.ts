import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PassThrough } from 'stream';
import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt'
import { Public } from '../auth/guards/public';
import { Roles } from '../decorators/roles.decorators';
import { Role } from '../enums/role.enums';
import { AuthGuard } from '../auth/guards/authGuard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post('register')
  async create(@Body() createUserDto: CreateUserDto,@Res({passthrough:true}) response:Response) {
    const hash = await bcrypt.hash(createUserDto.password,12)
    createUserDto.password = hash
    return await this.usersService.create(createUserDto,response)
  }

  @Roles(Role.BUYER)
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard)
  @Get('all')
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch('update')
  update(@Body() updateUserDto: UpdateUserDto,@Req()request:Request) {
    return this.usersService.update(updateUserDto,request);
  }

  @Delete('delete')
  remove(@Req() request:Request) {
    return this.usersService.remove(request);
  }
}
