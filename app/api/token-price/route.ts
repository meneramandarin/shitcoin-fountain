import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const contractAddress = searchParams.get('address');

  if (!contractAddress) {
    return NextResponse.json({ error: 'Missing contract address' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/token_price/base?contract_addresses=${contractAddress.toLowerCase()}&vs_currencies=usd`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    const price = data[contractAddress.toLowerCase()]?.usd;

    return NextResponse.json({ price: price || null });
  } catch (error) {
    console.error('Price fetch error:', error);
    return NextResponse.json({ price: null });
  }
}
