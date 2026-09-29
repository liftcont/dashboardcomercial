import { NextRequest, NextResponse } from 'next/server';
import { getRDStationAPI } from '@/lib/rdstation/api';
import { useRDStationStore } from '@/lib/store';

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('rdstation_access_token')?.value;
    const refreshToken = request.cookies.get('rdstation_refresh_token')?.value;

    if (!accessToken || !refreshToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const clientId = process.env.RDSTATION_CLIENT_ID;
    const clientSecret = process.env.RDSTATION_CLIENT_SECRET;
    const redirectUri = process.env.RDSTATION_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const api = getRDStationAPI({
      clientId,
      clientSecret,
      redirectUri,
    });

    api.setTokens(accessToken, refreshToken, 3600);

    const [contactsRes, dealsRes, campaignsRes, stagesRes] = await Promise.all([
      api.getContacts(1, 500),
      api.getDeals(1, 500),
      api.getCampaigns(1, 100),
      api.getFunnelStages(),
    ]);

    return NextResponse.json({
      contacts: contactsRes.data,
      deals: dealsRes.data,
      campaigns: campaignsRes.data,
      funnelStages: stagesRes,
    });
  } catch (err) {
    console.error('Sync error:', err);
    return NextResponse.json(
      { error: 'Failed to sync data' },
      { status: 500 }
    );
  }
}