import { NextRequest, NextResponse } from 'next/server';
import { initDB } from '@/lib/seed';

export async function POST(req: NextRequest) {
  // Hard-blocked in production — this endpoint seeds the entire database
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  // Require a static init secret even in development/staging
  const secret = req.headers.get('x-init-secret');
  const expected = process.env.INIT_SECRET;
  if (!expected || secret !== expected) {
    return NextResponse.json({ error: 'Forbidden — missing or invalid x-init-secret header' }, { status: 403 });
  }

  try {
    await initDB();
    return NextResponse.json({ success: true, message: 'Database initialized and seeded' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
