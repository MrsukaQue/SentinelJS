import { randomUUID } from 'node:crypto';
import { afterAll, describe, expect, it } from 'vitest';
import { db } from '../src/database/client.js';

describe('database', () => {
  const email = `${randomUUID()}@example.test`;
  afterAll(() => db.$disconnect());
  it('cascades user-owned scan data', async () => {
    const user = await db.user.create({ data: { email, passwordHash: 'not-a-real-hash' } });
    const target = await db.target.create({
      data: { userId: user.id, url: 'https://example.test/', hostname: 'example.test' },
    });
    await db.scan.create({
      data: { userId: user.id, targetId: target.id, scannerVersion: 'test' },
    });
    await db.user.delete({ where: { id: user.id } });
    expect(await db.scan.count({ where: { userId: user.id } })).toBe(0);
  });
});
