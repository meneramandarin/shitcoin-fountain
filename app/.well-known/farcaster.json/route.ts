import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    accountAssociation: {
      header:
        '', // Leave empty - will be generated at base.dev/preview after deployment
      payload: '', // Leave empty - will be generated at base.dev/preview after deployment
      signature: '', // Leave empty - will be generated at base.dev/preview after deployment
    },
    frame: {
      version: '1',
      name: 'Shitcoin Fountain',
      iconUrl: 'https://shitcoinfountain.fun/fountain.png',
      homeUrl: 'https://shitcoinfountain.fun/base',
      imageUrl: 'https://shitcoinfountain.fun/fountain.png',
      buttonTitle: 'Throw Shitcoins',
      splashImageUrl: 'https://shitcoinfountain.fun/fountain.gif',
      splashBackgroundColor: '#ffffff',
      webhookUrl: 'https://shitcoinfountain.fun/base',
    },
  };

  return NextResponse.json(manifest);
}
