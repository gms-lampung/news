import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const auth = request.headers.get('authorization');
  const secret = process.env.REVALIDATION_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  revalidatePath('/');
  return NextResponse.json({ revalidated: true, timestamp: Date.now() });
}
