import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Define CORS headers to allow requests from any origin
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allows any origin
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // This is a preflight request. It's a security check browsers do before the actual request.
  // We need to respond with the CORS headers to let it proceed.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { reportedUser, reporter, message, reason } = await req.json();

    // --- Send Email with Resend ---
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      },
      body: JSON.stringify({
        from: 'RetroConnect <noreply@retroconnect.app>',
        to: [reportedUser.email],
        bcc: [reporter.email],
        subject: `Update on your recent report on RetroConnect`,
        html: `
          <p>Hello,</p>
          <p>This is an update regarding a report on RetroConnect.</p>
          <hr/>
          <p><b>To the reported user (${reportedUser.username}):</b></p>
          <p>${message}</p>
          <hr/>
          <p><b>To the reporter (${reporter.username}):</b></p>
          <p>Thank you for your report concerning "${reason}". We have taken action on this matter by sending the above warning.</p>
          <p>Thank you for helping keep our community safe.</p>
        `,
      }),
    });
    
    if (!resendResponse.ok) {
      const errorBody = await resendResponse.text();
      throw new Error(`Resend API Error: ${errorBody}`);
    }
    console.log('Email sent successfully.');

    return new Response(JSON.stringify({ success: true, message: "Email notification sent." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    // --- FIXED: Added a check to handle the 'unknown' type ---
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
