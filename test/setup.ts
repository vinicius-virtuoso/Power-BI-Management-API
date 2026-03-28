// test/setup.ts
import { execSync } from 'child_process';

export default async function () {
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
  });
}
