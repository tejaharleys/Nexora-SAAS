import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// CORS Headers utility
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle Preflight OPTIONS requests for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// This is the core ingestion endpoint where other apps send their data
export async function POST(req: Request) {
  try {
    // 1. Get the API Key from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header. Expected Format: Bearer <API_KEY>' },
        { status: 401, headers: corsHeaders }
      );
    }
    const apiKey = authHeader.split(' ')[1];

    // 2. Validate the API Key against our database
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('org_id')
      .eq('api_key', apiKey)
      .single();

    if (keyError || !keyData) {
      return NextResponse.json({ error: 'Invalid API Key' }, { status: 401, headers: corsHeaders });
    }

    const orgId = keyData.org_id;

    // 3. Parse the incoming event payload
    const body = await req.json();
    const { event_name, user_id, latency = 0, status = 'ok', metadata = {}, dashboard } = body;

    if (dashboard) {
      metadata.dashboard = dashboard;
    }

    if (!event_name) {
      return NextResponse.json({ error: 'event_name is required' }, { status: 400, headers: corsHeaders });
    }

    // 4. Insert the event into the database
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .insert([
        {
          org_id: orgId,
          event_name,
          user_id,
          latency,
          status,
          metadata,
        },
      ])
      .select()
      .single();

    if (eventError) {
      console.error('Failed to insert event:', eventError);
      return NextResponse.json({ error: 'Failed to ingest event' }, { status: 500, headers: corsHeaders });
    }

    // 5. Success! The event is now in the DB and Supabase Realtime will broadcast it
    return NextResponse.json(
      { success: true, message: 'Event ingested successfully', event_id: eventData.id },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Ingestion Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}
