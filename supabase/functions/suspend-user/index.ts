// supabase/functions/suspend-user/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // In a real application, you should add security logic here to
    // verify that the request is coming from an authorized admin.
    
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
    // --- UPDATED: Type-safe error handling ---
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error('Suspend User Function Error:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
