import { Controller, Get, Post, Patch, Delete, ParseIntPipe, Logger } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { MessagePattern, Payload } from "@nestjs/microservices";

@Controller("products")
export class ProductsController {
  private readonly logger = new Logger("Products Microservice");

  constructor(private readonly productsService: ProductsService) {}

  @MessagePattern("createProduct")
  create(@Payload() createProductDto: CreateProductDto) {
    this.logger.log(`Creating product...`);
    return this.productsService.create(createProductDto);
  }

  @MessagePattern("findAllProducts")
  findAll(@Payload() paginationDto: PaginationDto) {
    this.logger.log(`Fetching products...`);
    return this.productsService.findAll(paginationDto);
  }

  @MessagePattern("findOneProduct")
  findOne(@Payload("id", ParseIntPipe) id: number) {
    this.logger.log(`Fetching product...`);
    return this.productsService.findOne(id);
  }

  @MessagePattern("updateProduct")
  update(@Payload() updateProductDto: UpdateProductDto) {
    this.logger.log(`Updating product...`);
    return this.productsService.update(updateProductDto);
  }

  @MessagePattern("removeProduct")
  remove(@Payload("id", ParseIntPipe) id: number) {
    this.logger.log(`Removing product...`);
    return this.productsService.remove(id);
  }

  @MessagePattern("disableProduct")
  disable(@Payload("id", ParseIntPipe) id: number) {
    this.logger.log(`Disabling product...`);
    return this.productsService.disable(id);
  }

  @MessagePattern("validateProductsExists")
  validateProductsExists(@Payload() ids: number[]) {
    this.logger.log(`Validating products exist...`);
    return this.productsService.validateProductsExists(ids);
  }
}
