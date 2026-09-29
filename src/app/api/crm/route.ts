import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  const crmToken = process.env.RD_CRM_TOKEN;

  if (!crmToken) {
    return NextResponse.json({ error: 'Token do CRM não configurado.' }, { status: 500 });
  }
  if (!endpoint) {
    return NextResponse.json({ error: 'Endpoint não especificado.' }, { status: 400 });
  }

  try {
    // Repassa os outros parâmetros (como page, limit)
    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (key !== 'endpoint') params.append(key, value);
    });
    params.append('token', crmToken);

    const url = `https://crm.rdstation.com/api/v1/${endpoint}?${params.toString()}`;
    const response = await axios.get(url, {
      headers: { 'Accept': 'application/json' }
    });
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Erro na API do CRM:', error?.response?.data || error.message);
    return NextResponse.json({ error: 'Falha ao buscar dados do CRM' }, { status: error?.response?.status || 500 });
  }
}
