// The service stands in for the primary database, and it is slow ON PURPOSE.
// Every query pays DB_DELAY_MS (default 30ms) — the simulated round-trip to a
// database that is not on your machine — and then scans the whole table,
// because nothing here is indexed and nothing is cached.
//
// Do not "fix" this file by deleting the delay. The briefs on this rung are
// about not paying it on every request, and your load-test baseline is only
// honest if the slow path stays slow.
import { Injectable } from "@nestjs/common";

export interface Product {
  id: number;
  name: string;
  category: string;
  price_paise: number;
  rating: number;
  in_stock: boolean;
}

const CATEGORIES = ["beauty", "electronics", "fashion", "grocery", "home", "sports", "toys"];

// Deterministic PRNG (mulberry32): every clone gets exactly the same rows,
// so numbers quoted in a pull request are reproducible.
function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export class ProductsService {
  readonly queryCostMs: number;
  private readonly products: Product[] = [];

  constructor() {
    const rows = Number(process.env.SEED_ROWS) >= 0 ? Number(process.env.SEED_ROWS) : 50000;
    this.queryCostMs = Number(process.env.DB_DELAY_MS) >= 0 ? Number(process.env.DB_DELAY_MS) : 30;
    const rand = mulberry32(42);
    for (let i = 1; i <= rows; i++) {
      this.products.push({
        id: i,
        name: `Product ${i}`,
        category: CATEGORIES[Math.floor(rand() * CATEGORIES.length)],
        price_paise: 999 + Math.floor(rand() * 500000),
        rating: Math.round((1 + rand() * 4) * 10) / 10,
        in_stock: rand() > 0.2,
      });
    }
  }

  count(): number {
    return this.products.length;
  }

  // Pays the round-trip cost, then scans the whole table for one row.
  async get(id: number): Promise<Product | undefined> {
    await sleep(this.queryCostMs);
    return this.products.find((p) => p.id === id); // full scan — no index
  }

  // Returns every matching row. No pagination, no cache.
  async byCategory(category?: string): Promise<Product[]> {
    await sleep(this.queryCostMs);
    if (!category) return this.products;
    return this.products.filter((p) => p.category === category);
  }
}
