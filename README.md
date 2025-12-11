# Shitcoin Fountain

A satirical Solana dApp where you can throw your unwanted tokens into a virtual fountain and receive fortunes about your crypto journey.

Live at: **[shitcoinfountain.fun](https://shitcoinfountain.fun)**

## What is this?

Shitcoin Fountain is a humorous cryptocurrency application that lets you:

1. Connect your Solana wallet
2. Select tokens from your portfolio (especially those low-value ones)
3. "Throw" them into a virtual fountain
4. Receive a witty, cynical fortune about crypto culture
5. Share your fortune on social media

It's part entertainment, part commentary on the cryptocurrency ecosystem—blending humor about crypto culture with actual blockchain transactions.

## Features

- **Real Blockchain Transactions**: Actual Solana token transfers to the fountain wallet
- **Token Support**: Works with both SPL Token and Token-2022 standards
- **Wallet Integration**: Compatible with Phantom, Solflare, and mobile Solana wallets
- **Fortune Generation**: 70+ unique fortunes with special messages for those who throw their entire portfolio
- **Social Sharing**: Generate shareable images with your fortune and stats for Twitter/X
- **User Statistics**: Track your offerings vs. the fountain's treasury
- **Sound Effects**: Optional fountain ambiance

## Tech Stack

- **Framework**: Next.js 16.0.7 with React 19.2.1
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **Blockchain**: Solana (mainnet via Helius RPC)
- **Wallet**: @solana/wallet-adapter
- **State Management**: TanStack React Query
- **Utilities**: html2canvas for screenshot generation
- **Analytics**: Vercel Analytics

## Getting Started

### Prerequisites

- Node.js (latest LTS recommended)
- A Helius API key (get one at [helius.dev](https://helius.dev))

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Add your Helius API key to .env.local
NEXT_PUBLIC_HELIUS_API_KEY=your_api_key_here
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

## Project Structure

```
shitcoin-fountain/
├── app/                      # Next.js app directory
│   ├── page.tsx              # Main application logic and UI
│   ├── layout.tsx            # Root layout with metadata
│   ├── providers.tsx         # Solana wallet configuration
│   ├── solana.ts             # Blockchain interaction logic
│   ├── TokenPicker.tsx       # Token selection modal
│   ├── CelebrationScreen.tsx # Animation component
│   └── globals.css           # Global styles
├── public/                   # Static assets
│   ├── fountain.gif          # Main fountain animation
│   ├── toss.gif              # Celebration animation
│   ├── fountain.mp3          # Sound effect
│   └── ...                   # Other images and assets
├── stubs/                    # Module stubs for build optimization
└── ...config files
```

## How It Works

### Token Throwing Flow

1. User connects their Solana wallet
2. App fetches all fungible tokens from the wallet using Helius RPC
3. User selects a token and amount to throw
4. Transaction is built with:
   - Priority fees for congestion avoidance
   - Compute budget limits
   - Automatic Associated Token Account (ATA) creation if needed
5. User signs and sends the transaction
6. After confirmation, a fortune is displayed
7. User can share their fortune with generated image

### Blockchain Integration

- **Fountain Wallet**: `9vAVbfw53JNkiCdbK7ZURUweXFqApKK7w8ezAp3bJX1y`
- **RPC Provider**: Helius (mainnet.helius-rpc.com)
- **Token Standards**: SPL Token and Token-2022
- **Priority Fees**: 100,000 micro-lamports
- **Compute Budget**: 200,000 units

### Data Persistence

User statistics are stored in browser localStorage, tracking:
- Top 3 tokens thrown and amounts
- Comparison with fountain's treasury

## Configuration

### Environment Variables

```env
NEXT_PUBLIC_HELIUS_API_KEY=your_helius_api_key
```

### Build Configuration

The project uses Next.js 16 with Turbopack (default) and includes webpack aliasing for:
- Mobile wallet adapter dependencies
- Logging utilities

## Scripts

```bash
npm run dev      # Start development server with Turbopack
npm run build    # Build for production
npm start        # Run production server
npm run lint     # Run ESLint
```

## Contributing

This is a satirical art project and social commentary on cryptocurrency culture. Feel free to fork and create your own version!

## License

MIT

## Acknowledgments

Special thanks to all the shitcoins that made this possible.

---

*Remember: The fountain knows all your crypto sins.*
