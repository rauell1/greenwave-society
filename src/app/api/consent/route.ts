import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getGeoTargetingInfo } from '@/lib/consent/geotargeting';
import crypto from 'crypto';

export async function GET(request: Request) {
  try {
    const db = getDb();
    const countryHeader = request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry');
    const geo = getGeoTargetingInfo(countryHeader);

    let config = await db.consentBannerConfig.findUnique({
      where: { id: 'default' },
    });

    if (!config) {
      config = await db.consentBannerConfig.create({
        data: {
          id: 'default',
          themeColor: '#166534',
          layout: 'bottom-bar',
          position: 'bottom',
          defaultLang: 'en',
          consentModeV2: true,
          tcfEnabled: true,
          geoTargeting: true,
          autoBlock: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      config,
      geo,
    });
  } catch (error) {
    console.error('Error in GET /api/consent:', error);
    // Return fallback config if DB isn't ready
    return NextResponse.json({
      success: true,
      config: {
        id: 'default',
        themeColor: '#166534',
        layout: 'bottom-bar',
        position: 'bottom',
        defaultLang: 'en',
        consentModeV2: true,
        tcfEnabled: true,
        geoTargeting: true,
        autoBlock: true,
      },
      geo: {
        countryCode: 'KE',
        region: 'GLOBAL',
        requiresOptIn: false,
        requiresOptOut: true,
      },
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { consentId, categories, consentType, consentModeState, tcfVector, userAgent } = body;

    const db = getDb();
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
    const countryCode = request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry') || 'GLOBAL';

    const log = await db.consentLog.create({
      data: {
        consentId: consentId || `cnst_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        categories: typeof categories === 'string' ? categories : JSON.stringify(categories),
        ipHash,
        countryCode,
        consentType: consentType || 'opt-in',
        consentModeState: consentModeState ? JSON.stringify(consentModeState) : null,
        tcfVector,
        userAgent: userAgent || request.headers.get('user-agent') || 'Unknown',
      },
    });

    return NextResponse.json({ success: true, logId: log.id });
  } catch (error) {
    console.error('Error logging consent in POST /api/consent:', error);
    return NextResponse.json({ success: true, note: 'Consent registered client-side' });
  }
}
