import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function check() {
  try {
    const schemas: any[] = await prisma.$queryRaw`
      SELECT schema_name FROM information_schema.schemata;
    `;
    console.log("Schemas:", schemas.map(s => s.schema_name));

    const tables: any[] = await prisma.$queryRaw`
      SELECT table_schema, table_name FROM information_schema.tables 
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema');
    `;
    console.log("Tables:", tables);

    const memberCount = await prisma.memberRegistration.count();
    console.log("MemberRegistration count in DB:", memberCount);
  } catch (err) {
    console.error("Check error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
