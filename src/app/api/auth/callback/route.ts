import { NextRequest, NextResponse } from 'next/server';
import { initializeRDStationAPI } from '@/lib/rdstation/api';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/dashboard?error=missing_code', request.url)
    );
  }

  try {
    const clientId = process.env.RDSTATION_CLIENT_ID;
    const clientSecret = process.env.RDSTATION_CLIENT_SECRET;
    const redirectUri = process.env.RDSTATION_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('RD Station credentials not configured');
    }

    const api = initializeRDStationAPI({
      clientId,
      clientSecret,
      redirectUri,
    });

    const tokens = await api.exchangeCodeForToken(code);

    const response = NextResponse.redirect(new URL('/dashboard', request.url));

    response.cookies.set('rdstation_access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in,
    });

    response.cookies.set('rdstation_refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (err) {
    console.error('OAuth callback error:', err);
    return NextResponse.redirect(
      new URL('/dashboard?error=auth_failed', request.url)
    );
  }
}