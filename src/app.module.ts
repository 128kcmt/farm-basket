import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './components/users/users.module';
import { JwtMiddleware } from './components/services.ts/jwtMiddleware';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './components/auth/auth.module';
import { ProductsModule } from './components/products/products.module';
import { ShopModule } from './components/shop/shop.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './components/users/entities/user.entity';
import { Product } from './components/products/entities/product.entity';
import { Shop } from './components/shop/entities/shop.entity';
import { MulterModule } from '@nestjs/platform-express';
import { CloudinaryService } from './components/services.ts/cloudinary.service';
import { ImageModule } from './components/image/image.module';
import { ImageController } from './components/image/image.controller';
import { MessagingModule } from './components/messaging/messaging.module';

@Module({
  imports: [UsersModule,JwtModule,AuthModule, ProductsModule, ShopModule,ImageModule,MessagingModule,
    ConfigModule.forRoot({
      isGlobal:true,
      envFilePath: ".env"
    }),
    TypeOrmModule.forRootAsync({
      imports:[ConfigModule],
      useFactory:async (configService : ConfigService)=>({
        type:'postgres',
        url:configService.get<string>('DATABASE_URL'),
        entities:[Users,Product,Shop],
        synchronize: false,
      }),
      inject:[ConfigService]
    }),
    MulterModule.register({
      dest:'./uploads'
    }),
    MessagingModule,
    
  ],
  controllers: [AppController,ImageController],//imagecontroller
  providers: [AppService,CloudinaryService],//cloudinaryservice
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
      consumer.apply(JwtMiddleware).forRoutes('*')
  }
}
