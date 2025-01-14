import { Module } from "@nestjs/common";
import { ProductsModule } from "./products/products.module";
import { ConfigModule } from "@nestjs/config";
import { environments } from "./config/environments";
import { PrismaModule } from "./database/prisma.module";
import config from "./config/config";
import * as Joi from "joi";

@Module({
  imports: [
    ProductsModule,
    ConfigModule.forRoot({
      envFilePath: environments[process.env.NODE_ENV],
      load: [config],
      isGlobal: true,
      validationSchema: Joi.object({
        NATS_SERVERS: Joi.string()
          .custom((value, helpers) => {
            const servers = value.split(",");
            if (servers.every((server: any) => typeof server === "string")) {
              return servers;
            } else {
              return helpers.message({
                "any.invalid": "NATS_SERVERS must be a valid list of strings",
              });
            }
          })
          .required(),
        DATABASE_URL: Joi.string().required(),
      }),
    }),
    PrismaModule,
  ],
})
export class AppModule {}
