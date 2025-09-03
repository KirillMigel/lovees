import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({ 
    ok: true, 
    time: new Date().toISOString(),
    message: "Lovees App is running! (updated)"
  });
}