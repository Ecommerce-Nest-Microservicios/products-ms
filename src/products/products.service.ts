import { Injectable } from "@nestjs/common";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { PrismaService } from "src/database/prisma.service";
import { catchError, from, map, Observable, switchMap } from "rxjs";
import { IProductServiceResponse, IProductsServiceResponse } from "./interfaces/product.interface";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { RpcException } from "@nestjs/microservices";

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  create(product: CreateProductDto): Observable<IProductServiceResponse> {
    return from(this.prisma.product.create({ data: product })).pipe(
      map((productSaved) => ({
        ok: true,
        message: "Product created!",
        data: productSaved,
      })),
      catchError((error) => {
        throw error instanceof RpcException
          ? error
          : new RpcException({
              message: error.message || "Unexpected error occurred",
              error: error.code || "Internal Server Error",
              code: 500,
            });
      }),
    );
  }

  findAll(paginationDto: PaginationDto): Observable<IProductsServiceResponse> {
    const { page = 1, limit = 6 } = paginationDto;
    const offset = Math.abs(page - 1) * limit;
    return from(
      Promise.all([
        this.prisma.product.findMany({
          take: limit,
          skip: offset,
          where: {
            available: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
        this.prisma.product.count({
          where: {
            available: true,
          },
        }),
      ]),
    ).pipe(
      map(([products, totalCount]) => {
        if (!products.length) {
          throw new RpcException({
            message: `No products found for the given criteria.`,
            error: "Not Found",
            code: 404,
          });
        } else {
          const totalPages = Math.ceil(totalCount / limit);
          const nextPage = page < totalPages ? page + 1 : null;
          const prevPage = page > 1 ? page - 1 : null;

          return {
            ok: true,
            message: "Products fetched!",
            data: products,
            totalCount,
            count: products.length,
            totalPages,
            nextPage,
            prevPage,
          };
        }
      }),
      catchError((error) => {
        throw error instanceof RpcException
          ? error
          : new RpcException({
              message: error.message || "Unexpected error occurred",
              error: error.code || "Internal Server Error",
              code: 500,
            });
      }),
    );
  }

  findOne(id: number): Observable<IProductServiceResponse> {
    return from(
      this.prisma.product.findFirst({
        where: {
          id: id,
          available: true,
        },
      }),
    ).pipe(
      map((product) => {
        if (!product) {
          throw new RpcException({
            message: `No product found for the given criteria.`,
            error: "Not Found",
            code: 404,
          });
        } else {
          return {
            ok: true,
            message: "Product fetched!",
            data: product,
          };
        }
      }),
      catchError((error) => {
        throw error instanceof RpcException
          ? error
          : new RpcException({
              message: error.message || "Unexpected error occurred",
              error: error.code || "Internal Server Error",
              code: 500,
            });
      }),
    );
  }

  update(updateProduct: UpdateProductDto): Observable<IProductServiceResponse> {
    const { id, ...product } = updateProduct;
    return this.findOne(id).pipe(
      switchMap(() => {
        return from(
          this.prisma.product.update({
            data: product,
            where: {
              id,
            },
          }),
        ).pipe(
          map((productUpdated) => {
            return {
              ok: true,
              message: "Product updated!",
              data: productUpdated,
            };
          }),
          catchError((error) => {
            throw error instanceof RpcException
              ? error
              : new RpcException({
                  message: error.message || "Unexpected error occurred",
                  error: error.code || "Internal Server Error",
                  code: 500,
                });
          }),
        );
      }),
    );
  }

  remove(id: number): Observable<IProductServiceResponse> {
    return this.findOne(id).pipe(
      switchMap(() => {
        return from(
          this.prisma.product.delete({
            where: {
              id,
            },
          }),
        ).pipe(
          map((productDeleted) => {
            return {
              ok: true,
              message: "Product deleted!",
              data: productDeleted,
            };
          }),
          catchError((error) => {
            throw error instanceof RpcException
              ? error
              : new RpcException({
                  message: error.message || "Unexpected error occurred",
                  error: error.code || "Internal Server Error",
                  code: 500,
                });
          }),
        );
      }),
    );
  }

  disable(id: number): Observable<IProductServiceResponse> {
    return this.findOne(id).pipe(
      switchMap(() => {
        return from(
          this.prisma.product.update({
            where: {
              id,
            },
            data: {
              available: false,
            },
          }),
        ).pipe(
          map((productUpdated) => {
            return {
              ok: true,
              message: "Product disabled!",
              data: productUpdated,
            };
          }),
          catchError((error) => {
            throw error instanceof RpcException
              ? error
              : new RpcException({
                  message: error.message || "Unexpected error occurred",
                  error: error.code || "Internal Server Error",
                  code: 500,
                });
          }),
        );
      }),
    );
  }

  validateProductsExists(ids: number[]): Observable<IProductsServiceResponse> {
    ids = Array.from(new Set(ids));

    return from(
      this.prisma.product.findMany({
        where: {
          id: {
            in: ids,
          },
          available: true,
        },
      }),
    ).pipe(
      map((products) => {
        const foundIds = products.map((product) => product.id);
        const missingIds = ids.filter((id) => !foundIds.includes(id));

        if (missingIds.length) {
          const messageErrors = missingIds.map((id) => `The product with id ${id} doesn't exist or is not available.`);

          throw new RpcException({
            message: "Some products do not exist or are not available.",
            errors: messageErrors,
            error: "Not Found",
            code: 404,
          });
        } else {
          return {
            ok: true,
            message: "Products Existing!",
            data: products,
          };
        }
      }),
      catchError((error) => {
        throw error instanceof RpcException
          ? error
          : new RpcException({
              message: error.message || "Unexpected error occurred",
              error: error.code || "Internal Server Error",
              code: 500,
            });
      }),
    );
  }
}
