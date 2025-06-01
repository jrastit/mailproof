import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    console.log('POST /api/check called');
    try {
        const { check_hash } = await request.json();

        const response = await fetch(
            `${process.env.MAILPROOF_SERVER}/api/check?validate_hash=${check_hash}`
        );

        if (!response.ok) {
            console.error('Failed to fetch check status:', response.status, await response.text());
            return NextResponse.json({ error: 'API call failed' }, { status: 500 });
        }

        const data = await response.json();
        const status = data?.proof?.payload?.status;

        return NextResponse.json({ status });
    } catch (error) {
        console.error('Error during check:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}