#!/bin/bash

echo "🚀 Active Reading App - Quick Start"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✓ Node.js version: $(node -v)"
echo ""

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "❌ Server dependency installation failed"
    exit 1
fi
cd ..

# Install client dependencies  
echo "📦 Installing client dependencies..."
cd client
npm install
if [ $? -ne 0 ]; then
    echo "❌ Client dependency installation failed"
    exit 1
fi
cd ..

# Check for .env file
if [ ! -f "server/.env" ]; then
    echo ""
    echo "⚠️  No .env file found!"
    echo "📝 Creating .env from .env.example..."
    cp server/.env.example server/.env
    echo ""
    echo "🔑 IMPORTANT: Edit server/.env and add your OPENROUTER_API_KEY"
    echo "   Get one free at: https://openrouter.ai"
    echo ""
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "📖 Next steps:"
echo "   1. Add your API key to server/.env"
echo "   2. Run 'cd server && npm run dev' in one terminal"
echo "   3. Run 'cd client && npm run dev' in another terminal"
echo "   4. Open http://localhost:3000"
echo ""
