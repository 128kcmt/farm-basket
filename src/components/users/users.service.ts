import { ForbiddenException, Injectable, NotFoundException, Req, Res, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Request, response, Response } from 'express';
import { Role } from '../enums/role.enums';
import { MailService } from '../services.ts/mail.service';
import { AccountStatus } from '../enums/status.enums';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersrep : Repository<Users>,
    private  jwtService : JwtService,
  ){}

  async create(createUserDto: CreateUserDto,@Res({passthrough:true}) response:Response) {
      const { email,name } = createUserDto;

      const exists = await this.usersrep.findOne({where: {email}})
      if(exists){
        throw new ForbiddenException('email already exists, please login')
      }
      createUserDto.role= Role.BUYER
      const user = await this.usersrep.save(createUserDto)

      const payload = {
        userid : user.userid,
        email : user.email,
        name : user.name,
        role : user.role,
        status : user.status,
        location : user.location
      }
      const jwt = await this.jwtService.signAsync(payload, {
        secret:process.env.JWT_SECRET
      })
      return{
        access_token : jwt,
        data : payload
      }     
  }

  async findAll() : Promise <Users[]> {
    return await this.usersrep.find({select: [
      'userid','email','cart','inboxparticipants','location','status','role','payments','message','name','notification','order','reports',
    ]}) 
  }

  async findMail(email : string):Promise<Users | undefined>{
    return await this.usersrep.findOne({where : {email}})
  }

  async findOne(userid: number) : Promise <Users> {
    return await this.usersrep.findOne({where : {userid},select:[
      'userid','email','cart','inboxparticipants','location','status','role','payments','message','name','notification','order','reports',
    ]})
  }

  async getUserStatus(userid : number){
    const user = await this.usersrep.findOne({where : {userid},select:[
      'userid','email','cart','inboxparticipants','location','status','role','payments','message','name','notification','order','reports',
    ]})
    return user.status
  }

  async update(updateUserDto: UpdateUserDto,userid : number,@Req() req:Request): Promise<Users> {
    const user = req.user?.userid
    const requester = await this.usersrep.findOne({where : {userid:user}})
    const account = await this.usersrep.findOne({where : {userid}})

    if (!requester){
      throw new NotFoundException('user not found')
    }
    if (!account) {
      throw new NotFoundException('user not found')
    }
    if (requester.userid !== account.userid) {
      throw new ForbiddenException('Cannot update this Account')
    }
    if (updateUserDto.role && updateUserDto.role === 'ADMIN') {
      throw new ForbiddenException('You cannot update role to admin')
    }
    Object.assign(requester,updateUserDto)

  return  await this.usersrep.save(requester)

  }

  async deactiveUser(userid : number) : Promise<void> {
    await this.usersrep.update(userid, { status : AccountStatus.DEACTIVATED})
  }
  
  async banUser(userid : number): Promise<void> {
    await this.usersrep.update(userid,{ status: AccountStatus.BANNED })
  }

  async activateUser(userid : number): Promise<void> {
    await this.usersrep.update(userid, {status : AccountStatus.ACTIVE})
  }
  
  async makeAdmin(userid,updateUserDto : UpdateUserDto): Promise<Users> {
    const newAdmin = await this.usersrep.findOne({where : {userid}})
    if (!newAdmin){
      throw new NotFoundException('user not found')
    }
    Object.assign(newAdmin,updateUserDto)
    await this.usersrep.save(newAdmin)
    return newAdmin

  }

  async saveResetToken(email: string, reset_token: string, expirationTime: Date){
    await this.usersrep.update(
      { email },
      {
        reset_token,
        reset_token_expiry: expirationTime
      }
    )
  }


  async remove(@Req() req:Request, @Res() response:Response) {
    try {
      const userid = req.user?.userid
      const requester = await this.usersrep.findOne({where : {userid}})
    
      if (!requester){
       throw new NotFoundException('user not found')
      }

      await this.usersrep.delete(userid)
      return response.status(200).json({
        message : "Successfully deleted Account"
      })
      }catch (error) {
      response.status(500).json({
        message : "Internal Server Error",
        error : error.message
      })
    }
  }

  async removedByAdmin(userid : number) {
    try {
      const user = await this.usersrep.findOne({where : {userid}})

      if (!user) {
        throw new NotFoundException('User not found')
      }
      await this.usersrep.delete(userid)

      return response.status(200).json({
        message : "Succesfully deleted user Account"
      })
    }catch (error) {
        response.status(500).json({
        message : "Internal Server error",
        error : error.message
      })
    }

  }
    async findOneById(userid: number): Promise<Users> {
      const user = await this.usersrep.findOne({ where: {userid} });
      if (!user) {
        throw new NotFoundException('User  not found');
      }
      return user;


  } 
}