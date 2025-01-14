import { registerAs } from "@nestjs/config";

export default registerAs("config", () => ({
  PORT: process.env.PORT,
}));
