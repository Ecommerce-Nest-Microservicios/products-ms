import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from "class-validator";
import { Type } from "class-transformer";

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsPositive()
  @Min(0)
  @Type(() => Number)
  limit?: number;
}
