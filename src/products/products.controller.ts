import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from "@nestjs/common";
import { ProductsService } from "./products.service";

@Controller("products")
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  // The full list — a large, unpaginated payload, on purpose.
  @Get()
  async list(@Query("category") category?: string) {
    return this.products.byCategory(category);
  }

  @Get(":id")
  async get(@Param("id") rawId: string) {
    const id = Number(rawId);
    if (!Number.isInteger(id)) {
      throw new BadRequestException("id must be a number");
    }
    const product = await this.products.get(id);
    if (!product) {
      throw new NotFoundException("no such product");
    }
    return product;
  }
}
