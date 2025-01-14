import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  available?: boolean;

  @IsNotEmpty()
  @Min(0)
  @IsNumber()
  @Type(() => Number)
  price: number;
}
