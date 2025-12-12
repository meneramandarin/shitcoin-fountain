import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shitcoin Fountain - Base',
  description: 'Throw your worthless tokens into the fountain and receive a fortune.',
  openGraph: {
    title: 'Shitcoin Fountain',
    description: 'Throw a shitcoin. Make a wish.',
    images: ['/fountain.png'],
  },
  other: {
    'base:app_id': '693b645fe6be54f5ed71d6dd',
    'fc:frame': 'vNext',
    'fc:frame:image': 'https://shitcoinfountain.fun/fountain.png',
    'fc:frame:button:1': 'Throw Shitcoins',
    'fc:frame:button:1:action': 'link',
    'fc:frame:button:1:target': 'https://shitcoinfountain.fun/base',
  },
};

export default function BaseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
