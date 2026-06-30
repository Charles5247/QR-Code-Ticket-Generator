// ============================================================
// MC FABS MASTERCLASS — Supabase Edge Function
// Payment Verification (Server-side Zainpay verification)
// ============================================================
// Deploy with: supabase functions deploy verify-payment
// File path: supabase/functions/verify-payment/index.ts
//
// This runs AFTER Zainpay redirects the user back to your
// callBackUrl (see server.js -> callBackUrl: `${PUBLIC_URL}/ticket`).
// Call this function from js/ticket.js (or wherever the callback
// page lands) with the txnRef Zainpay appends to the redirect URL,
// so payment status is confirmed server-side rather than trusted
// from the frontend/URL alone.
//
// NOTE ON THE VERIFY ENDPOINT: Zainpay's card transaction status
// endpoint path may differ slightly between sandbox/live or SDK
// versions (their official SDKs call it "verifyCardPaymentV2").
// Confirm the exact path in your Zainpay dashboard docs or with
// your Zainpay integration contact before going live; the value
// below reflects their documented Redirect/Card flow as of this
// integration but is worth a quick sanity check.

/*
import { serve } from '../vendor/deno/std@0.168.0/server.ts';
import { createClient } from '../vendor/deno/supabase-js.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { txnRef, attendee_id } = await req.json();

    if (!txnRef || !attendee_id) {
      return new Response(
        JSON.stringify({ error: 'Missing txnRef or attendee_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isTest = Deno.env.get('ZAINPAY_IS_TEST') === 'true';
    const baseUrl = isTest
      ? 'https://sandbox.zainpay.ng'
      : 'https://api.zainpay.ng';
    const secretKey = isTest
      ? Deno.env.get('ZAINPAY_TEST_SECRET_KEY')
      : Deno.env.get('ZAINPAY_LIVE_SECRET_KEY');

    if (!secretKey) {
      return new Response(
        JSON.stringify({ error: 'Missing ZAINPAY secret key' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the card/redirect transaction status with Zainpay.
    const verifyResponse = await fetch(
      `${baseUrl}/zainbox/card/verify/v2/payment/${txnRef}`,
      {
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const zainpayData = await verifyResponse.json();

    // Zainpay responses use { code: "00", data: { txnStatus: "success", ... } }
    if (zainpayData.code !== '00' || zainpayData.data?.txnStatus !== 'success') {
      return new Response(
        JSON.stringify({ error: 'Payment verification failed', details: zainpayData }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update attendee record in Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const amount = Number(zainpayData.data.amount) || 0;

    const { data, error } = await supabase
      .from('attendees')
      .update({
        payment_status: 'paid',
        payment_reference: txnRef,
        amount_paid: amount,
        paid_at: new Date().toISOString(),
      })
      .eq('id', attendee_id)
      .select()
      .single();

    if (error) throw error;

    // Send confirmation email (use Supabase email or third-party)
    // await sendConfirmationEmail(data);

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
*/

// ─── Environment Variables needed in Supabase Dashboard ───────────────────────
// ZAINPAY_IS_TEST = true | false
// ZAINPAY_TEST_SECRET_KEY = your sandbox secret key
// ZAINPAY_LIVE_SECRET_KEY = your live secret key
// SUPABASE_URL = (auto-set by Supabase)
// SUPABASE_SERVICE_ROLE_KEY = (auto-set by Supabase)
// EMAIL_SERVICE_API_KEY = your email service key (Resend, SendGrid, etc.)

console.log("Edge function template - deploy to Supabase functions");
