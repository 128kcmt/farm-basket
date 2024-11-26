import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { access } from "fs";
import { Observable } from "rxjs";
import { IS_PUBLIC_KEY } from "./public";
import { UsersService } from "src/components/users/users.service";
import { Request } from "express";


@Injectable()
export class AuthGuard implements CanActivate{
    constructor(
        private jwtService : JwtService,
        private reflector:Reflector ,
        private userService : UsersService
    ){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY,[
            context.getHandler(),
            context.getClass()
        ])

        if (isPublic){
            return true
        }
        const request = context.switchToHttp().getRequest()
        const token = this.extractTokenFromHeader(request)

        if (!token){
            throw new UnauthorizedException('you have no token')
        }
        try{
            const data = await this.jwtService.verifyAsync(token,
                {
                    secret:process.env.JWT_SECRET
                }
            )
            request['user'] =data
            
            const userid = data.userid
            const userStatus = await this.userService.getUserStatus(userid)

            if (userStatus !== 'ACTIVE') {
                throw new UnauthorizedException('Account is not active')
            }
        }catch(error){
            throw new UnauthorizedException('access denied:', error)
        }
        return true
    }
    private extractTokenFromHeader(request: Request): string | undefined{
        const [type,token] = request.headers.authorization?.split(' ')??[];
        return type === 'Bearer' ? token : undefined;
    }
}