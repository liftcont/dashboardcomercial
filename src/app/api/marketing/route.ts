import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  const marketingToken = process.env.RD_MARKETING_TOKEN;

  if (!marketingToken) {
    return NextResponse.json({ error: 'Token de Marketing não configurado.' }, { status: 500 });
  }
  if (!endpoint) {
    return NextResponse.json({ error: 'Endpoint não especificado.' }, { status: 400 });
  }

  try {
    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (key !== 'endpoint') params.append(key, value);
    });

    const url = `https://api.rd.services/platform/${endpoint}?${params.toString()}`;
    const response = await axios.get(url, {
      headers: { 
        'Accept': 'application/json',
        'Authorization': `Bearer ${marketingToken}`
      }
    });
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Erro na API de Marketing:', error?.response?.data || error.message);
    return NextResponse.json({ error: 'Falha ao buscar dados de Marketing' }, { status: error?.response?.status || 500 });
  }
}
