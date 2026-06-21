// ============================================================
// MC FABS MASTERCLASS — Supabase Edge Function
// Payment Verification (Server-side Paystack verification)
// ============================================================
// Deploy with: supabase functions deploy verify-payment
// File path: supabase/functions/verify-payment/index.ts

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
    const { reference, attendee_id } = await req.json();

    if (!reference || !attendee_id) {
      return new Response(
        JSON.stringify({ error: 'Missing reference or attendee_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify payment with Paystack
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const paystackData = await verifyResponse.json();

    if (!paystackData.status || paystackData.data.status !== 'success') {
      return new Response(
        JSON.stringify({ error: 'Payment verification failed', details: paystackData }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update attendee record in Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const amount = paystackData.data.amount / 100; // Convert from kobo

    const { data, error } = await supabase
      .from('attendees')
      .update({
        payment_status: 'paid',
        payment_reference: reference,
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
// PAYSTACK_SECRET_KEY = sk_live_YOUR_SECRET_KEY
// SUPABASE_URL = (auto-set by Supabase)
// SUPABASE_SERVICE_ROLE_KEY = (auto-set by Supabase)
// EMAIL_SERVICE_API_KEY = your email service key (Resend, SendGrid, etc.)

console.log("Edge function template - deploy to Supabase functions");
