import { ForbiddenException, Injectable, NotFoundException, Req, Res, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, response } from 'express';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersrep : Repository<Users>,
    private readonly jwtService : JwtService
  ){}

  async create(createUserDto: CreateUserDto,@Res({passthrough:true}) response:Response) {
    const { email } = createUserDto;

    const exists = await this.usersrep.findOne({where: {email}})
    if(exists){
      throw new ForbiddenException('email already exists, please login')
    }
    const user = await this.usersrep.save(createUserDto)

    const payload = {userid:user.userid,email:user.email,name:user.name,role:user.role,location:user.location}
    const jwt = await this.jwtService.signAsync(payload)
    response.cookie('jwt',jwt,{
      httpOnly: true,
      secure:true,
      maxAge:360000,
    })
    return {
      message: 'Account succesfully created'
    };
  }

  async findAll() {
    return await this.usersrep.find() 
  }

  async findOne(userid: number) {
    return await this.usersrep.findOne({where : {userid}})
  }

  async update(userid: number, updateUserDto: UpdateUserDto,@Req() req:Request) {
    const user = req.user?.userid
    const requester = await this.usersrep.findOne({where : {userid}})

    if (!requester){
      throw new NotFoundException('user not found')
    }

    if(user != requester.userid){
      throw new ForbiddenException('your not authorized to make this update')
    }
    Object.assign(requester,updateUserDto)

    await this.usersrep.save(requester)
    
    return{
      message : 'successfully updated'
    }
  }

  async remove(userid: number, @Req() req:Request) {
    const user = req.user?.userid
    const requester = await this.usersrep.findOne({where : {userid}})
    
    if (!requester){
      throw new NotFoundException('user not found')
    }

    if (user !== requester.userid){
      throw new UnauthorizedException('You are not authorized to delete this account')
    }

    await this.usersrep.delete(requester)
    return{
      message : 'successfully deleted user'
    }
  }
}
