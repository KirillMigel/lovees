#!/bin/bash

# Lovees App Environment Setup Script

echo "🚀 Setting up Lovees App environment..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "✅ .env.local created"
else
    echo "⚠️  .env.local already exists, skipping creation"
fi

# Generate NextAuth secret if not set
if ! grep -q "NEXTAUTH_SECRET=" .env.local || grep -q "NEXTAUTH_SECRET=your_nextauth_secret_key" .env.local; then
    echo "🔐 Generating NextAuth secret..."
    SECRET=$(openssl rand -base64 32)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=\"$SECRET\"/" .env.local
    else
        # Linux
        sed -i "s/NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=\"$SECRET\"/" .env.local
    fi
    echo "✅ NextAuth secret generated"
fi

echo ""
echo "📋 Next steps:"
echo "1. Edit .env.local and fill in your database URL"
echo "2. Configure S3/Cloudflare R2 credentials"
echo "3. Set up Google OAuth credentials"
echo "4. Run: npm run prisma:migrate"
echo "5. Run: npm run dev"
echo ""
echo "🔗 Useful links:"
echo "- Neon Database: https://neon.tech"
echo "- Cloudflare R2: https://dash.cloudflare.com"
echo "- Google OAuth: https://console.cloud.google.com"
echo "- Vercel: https://vercel.com"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
