import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ProductsService } from "./products/products.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const store = app.get(ProductsService);
  const port = Number(process.env.PORT) || 8080;
  await app.listen(port);
  console.log(
    `listening on :${port} — ${store.count()} products seeded, every query pays ~${store.queryCostMs}ms`
  );
}

bootstrap();
