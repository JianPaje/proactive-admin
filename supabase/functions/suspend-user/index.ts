// supabase/functions/suspend-user/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // IMPORTANT: Add your own logic here to verify that the request is coming from an admin.
    // This is just a basic example.
    
    const { userIdToSuspend } = await req.json();
    if (!userIdToSuspend) {
        throw new Error("User ID to suspend is required.");
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Update the user's status to 'suspended'
    const { error } = await supabaseAdmin
      .from('users')
      .update({ status: 'suspended' })
      .eq('id', userIdToSuspend);

    if (error) throw error;

    return new Response(JSON.stringify({ message: `User ${userIdToSuspend} has been suspended.` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})