import { readFileSync } from 'fs';

const envFile = readFileSync('.env.local', 'utf8');
for (const line of envFile.split('\n')) {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) process.env[key.trim()] = rest.join('=').trim().replace(/^"|"$/g, '');
}

const { PrismaClient } = await import('@prisma/client');
const prisma = new PrismaClient();

const OLD = 'greenwave.rauell.systems';
const NEW = 'greenwavesociety.org';

try {
  // 1. member_registrations.source
  const r1 = await prisma.$executeRaw`
    UPDATE member_registrations SET source = ${NEW} WHERE source = ${OLD}
  `;
  console.log(`member_registrations.source: ${r1} row(s) updated`);

  // 2. constitution_versions.content
  const r2 = await prisma.$executeRaw`
    UPDATE constitution_versions
    SET content = REPLACE(content, ${OLD}, ${NEW})
    WHERE content ILIKE ${'%' + OLD + '%'}
  `;
  console.log(`constitution_versions.content: ${r2} row(s) updated`);

  // 3. legal_policies.content
  const r3 = await prisma.$executeRaw`
    UPDATE legal_policies
    SET content = REPLACE(content, ${OLD}, ${NEW})
    WHERE content ILIKE ${'%' + OLD + '%'}
  `;
  console.log(`legal_policies.content: ${r3} row(s) updated`);

  // 4. cookie_scan_results.domain
  const r4 = await prisma.$executeRaw`
    UPDATE cookie_scan_results SET domain = ${NEW} WHERE domain = ${OLD}
  `;
  console.log(`cookie_scan_results.domain: ${r4} row(s) updated`);

  console.log('\nDone. All domain references updated to greenwavesociety.org');
} finally {
  await prisma.$disconnect();
}
