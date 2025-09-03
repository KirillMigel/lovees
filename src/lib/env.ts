export function getSiteOrigin(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXTAUTH_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ].filter(Boolean) as string[];
  
  // Always return a valid URL, even if env vars are empty
  const raw = candidates[0] || 'http://localhost:3000';
  
  try { 
    new URL(raw); 
    return raw; 
  } catch { 
    return 'http://localhost:3000'; 
  }
}

export function getSiteURL(): URL {
  return new URL(getSiteOrigin());
}
