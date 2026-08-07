import { readFileSync, writeFileSync } from 'fs';

// Load .env.local manually
const envFile = readFileSync('.env.local', 'utf8');
for (const line of envFile.split('\n')) {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) process.env[key.trim()] = rest.join('=').trim().replace(/^"|"$/g, '');
}

const { PrismaClient } = await import('@prisma/client');
const prisma = new PrismaClient();

try {
  // Introspect columns from information_schema
  const cols = await prisma.$queryRaw`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'baraza_registrations'
    ORDER BY ordinal_position
  `;
  console.log('Columns:', cols.map(c => `${c.column_name} (${c.data_type})`).join(', '));

  const rows = await prisma.$queryRaw`SELECT * FROM baraza_registrations ORDER BY "createdAt" ASC`;
  console.log(`Exported ${rows.length} rows`);

  writeFileSync('baraza-export.json', JSON.stringify({ columns: cols, rows }, null, 2));
  console.log('Saved to baraza-export.json');
} finally {
  await prisma.$disconnect();
}
