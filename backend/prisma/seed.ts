import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

const FLASH_SALE_PRODUCTS = [
  {
    name: 'Limited Edition Sneakers',
    description: 'Flash-drop exclusive colorway',
    priceCents: 12999,
    stock: 10,
  },
  {
    name: 'Vintage Graphic Tee',
    description: 'Single-run screen print',
    priceCents: 3499,
    stock: 25,
  },
  {
    name: 'Smart Watch Band',
    description: 'Premium silicone, flash-sale only',
    priceCents: 1999,
    stock: 50,
  },
  {
    name: 'Wireless Earbuds',
    description: 'Noise-cancelling, limited batch',
    priceCents: 7999,
    stock: 5,
  },
  {
    name: 'Insulated Water Bottle',
    description: '24h cold retention, matte black',
    priceCents: 2499,
    stock: 15,
  },
] as const;

async function main(): Promise<void> {
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();

  await prisma.product.createMany({ data: [...FLASH_SALE_PRODUCTS] });

  const products = await prisma.product.findMany({ orderBy: { name: 'asc' } });
  console.log(`Seeded ${products.length} flash-sale products:`);
  for (const p of products) {
    console.log(
      `  - ${p.name}: ${p.stock} units @ $${(p.priceCents / 100).toFixed(2)}`,
    );
  }
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
