// The tests shrink the dataset and zero the simulated round-trip so they stay
// fast; the slow defaults exist for the running server, not for npm test.
process.env.SEED_ROWS = "100";
process.env.DB_DELAY_MS = "0";

import { NotFoundException } from "@nestjs/common";
import { HealthController } from "../health.controller";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";

describe("HealthController", () => {
  it("answers ok", () => {
    expect(new HealthController().health()).toEqual({ status: "ok" });
  });
});

describe("ProductsController", () => {
  const controller = new ProductsController(new ProductsService());

  it("returns product 1", async () => {
    const product = await controller.get("1");
    expect(product.id).toBe(1);
  });

  it("404s on an unknown product", async () => {
    await expect(controller.get("99999")).rejects.toThrow(NotFoundException);
  });

  it("filters by category", async () => {
    const all = await controller.list();
    const beauty = await controller.list("beauty");
    expect(all.length).toBe(100);
    expect(beauty.length).toBeGreaterThan(0);
    expect(beauty.every((p) => p.category === "beauty")).toBe(true);
  });
});
