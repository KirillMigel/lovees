export function getSiteOrigin() {
  const c = [
    process.env.NEXT_PUBLIC_SITE_URL, 
    process.env.NEXTAUTH_URL, 
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined
  ].filter(Boolean) as string[];
  const raw = c[0] || "http://localhost:3000";
  try { 
    new URL(raw); 
    return raw; 
  } catch { 
    return "http://localhost:3000"; 
  }
}

export function getSiteURL() { 
  return new URL(getSiteOrigin()); 
}
