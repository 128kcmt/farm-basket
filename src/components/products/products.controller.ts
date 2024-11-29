import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Public } from '../auth/guards/public';
import { ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Products } from './entities/product.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../enums/role.enums';
import { Roles } from '../decorators/roles.decorators';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Roles(Role.SELLER)
  @UseGuards(RolesGuard)
  @Post('create')
  @ApiOperation({summary:"creates a shop and updates a user's role to seller"})
  @ApiResponse({
    status: 200,
    description: "succesfully posted a product"
  })
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.createProduct(createProductDto);
  }

  @Get()
  @ApiOperation({summary:"fetches all products"})
  @ApiOkResponse({
    description: "Successfully fetched all products"
  })
  findAllProducts() {
    return this.productsService.findAllProducts();
  }

  @Get('search')
  async searchByTYpe(@Query('type') type:string ): Promise<Products[]>{
    return await this.productsService.findByType(type)
  }

  @Get('name')
  async searchByName(@Query('name') name : string ): Promise<Products[]> {
    return await this.productsService.findByName(name)
  }

  @Get(':id')
  @ApiOperation({summary:"fetches a specific product by id"})
  @ApiOkResponse({
    description: "Successfully fetched a product  by id"
  })
  findProductById(@Param('id',ParseIntPipe) id: number) {
    return this.productsService.findProductById(id);
  }

  @Get(':shopid/products')
  @ApiOperation({summary:"fetches all products for a particular product"})
  @ApiOkResponse({
    description: "Successfully fetched all products for a particular shop by id"
  })
  findShopProducts(@Param('shopid',ParseIntPipe) shopid : number){
    return this.productsService.findShopProduct(shopid)
  }

  @Roles(Role.SELLER)
  @UseGuards(RolesGuard)
  @Patch(':id')
  @ApiOperation({summary:"Updates products details"})
  @ApiOkResponse({
    description: "Successfully updated product's details"
  })
  updateProduct(@Param('id',ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.updateProduct(id, updateProductDto);
  }

  @Roles(Role.SELLER)
  @UseGuards(RolesGuard)
  @Delete('delete/:id')
  @ApiOperation({summary:"Deletes a product"})
  @ApiOkResponse({
    description: "Successfully deleted a product"
  })
  removeProduct(@Param('id',ParseIntPipe) id: number) {
    return this.productsService.removeProduct(id);
  }
}