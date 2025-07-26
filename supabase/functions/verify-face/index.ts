import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Buffer } from "https://deno.land/std@0.177.0/node/buffer.ts";

// Helper to handle CORS preflight requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- Google Cloud Vision API Setup ---
const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
if (!GOOGLE_API_KEY) {
  throw new Error("Missing GOOGLE_API_KEY in environment variables.");
}
const VISION_API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_API_KEY}`;

// --- Helper Functions ---

// Loosely compares names to account for OCR errors or middle names.
const namesMatch = (nameFromForm: string, nameFromOcr: string): boolean => {
    if (!nameFromForm || !nameFromOcr) return false;
    const formNameParts = nameFromForm.toLowerCase().split(' ');
    const ocrNameLower = nameFromOcr.toLowerCase();
    return formNameParts.every(part => ocrNameLower.includes(part));
};

// NEW: Verifies the ID type using keywords found in the OCR text.
const verifyIdTypeWithOcr = (idType: string, ocrText: string): boolean => {
    if (!idType || !ocrText) return false;
    const text = ocrText.toLowerCase();
    
    // Define keywords for each ID type
    const keywords: { [key: string]: string[] } = {
        'passport': ['passport'],
        'national id': ['national id', 'philsys'],
        'driver\'s license': ['driver\'s license', 'land transportation office'],
        'prc id': ['professional regulation commission'],
        'umid': ['unified multi-purpose id'],
        'sss id': ['social security system'],
        'school id': ['school', 'university', 'college', 'campus'],
        'philippine postal id': ['postal id'],
        'hdmf (pag-ibig loyalty plus)': ['pag-ibig', 'hdmf'],
    };

    const selectedKeywords = Object.keys(keywords).find(key => idType.toLowerCase().includes(key));
    
    if (!selectedKeywords) {
        console.log(`No keywords defined for ID type: ${idType}. Skipping check.`);
        return true; 
    }

    
    return keywords[selectedKeywords].every(keyword => text.includes(keyword));
};


serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { selfieImageUrl, idFrontUrl, userData, idType } = await req.json();
    if (!selfieImageUrl || !idFrontUrl || !userData || !idType) {
      throw new Error('Missing required parameters.');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const BUCKET_NAME = 'admin';
    const selfiePath = new URL(selfieImageUrl).pathname.split(`/${BUCKET_NAME}/`)[1];
    const idFrontPath = new URL(idFrontUrl).pathname.split(`/${BUCKET_NAME}/`)[1];

    const { data: selfieData, error: selfieError } = await supabaseAdmin.storage.from(BUCKET_NAME).download(selfiePath);
    const { data: idFrontData, error: idFrontError } = await supabaseAdmin.storage.from(BUCKET_NAME).download(idFrontPath);

    if (selfieError || idFrontError) {
      throw new Error('Could not download images for verification.');
    }

    const selfieBase64 = Buffer.from(await selfieData.arrayBuffer()).toString('base64');
    const idFrontBase64 = Buffer.from(await idFrontData.arrayBuffer()).toString('base64');

    const visionRequest = {
      requests: [
        { image: { content: selfieBase64 }, features: [{ type: 'FACE_DETECTION', maxResults: 1 }] },
        { image: { content: idFrontBase64 }, features: [{ type: 'FACE_DETECTION', maxResults: 1 }, { type: 'TEXT_DETECTION' }] },
      ],
    };

    const visionResponse = await fetch(VISION_API_URL, {
      method: 'POST',
      body: JSON.stringify(visionRequest),
    });

    if (!visionResponse.ok) {
        const errorBody = await visionResponse.json();
        throw new Error(`Google Vision API request failed: ${errorBody.error.message}`);
    }

    const { responses } = await visionResponse.json();
    const selfieFaceAnnotation = responses[0]?.faceAnnotations?.[0];
    const idFaceAnnotation = responses[1]?.faceAnnotations?.[0];
    const idTextAnnotation = responses[1]?.fullTextAnnotation?.text;

    let matchFound = false;
    let verificationDetails = "Verification failed.";
    let similarityScore = 0;

    // ---  ID Type Verification Step ---
    if (idTextAnnotation && !verifyIdTypeWithOcr(idType, idTextAnnotation)) {
        return new Response(
          JSON.stringify({ match: false, details: `The uploaded document does not appear to be a ${idType}. Please upload the correct ID.` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
    }

    // Primary Check: Face Detection
    const faceMatchSuccess = !!selfieFaceAnnotation && (selfieFaceAnnotation.detectionConfidence > 0.90) && !!idFaceAnnotation && (idFaceAnnotation.detectionConfidence > 0.90);

    if (faceMatchSuccess) {
        matchFound = true;
        verificationDetails = "Face verification successful.";
        similarityScore = (selfieFaceAnnotation.detectionConfidence + idFaceAnnotation.detectionConfidence) * 50;
    } else if (idTextAnnotation) {
        // Fallback Check: OCR Text Matching
        const ocrText = idTextAnnotation.toLowerCase();
        const { firstName, lastName, date_of_birth, gender } = userData;

        const firstNameMatch = namesMatch(firstName, ocrText);
        const lastNameMatch = namesMatch(lastName, ocrText);
        const genderMatch = ocrText.includes(gender.toLowerCase());
        const dobSimple = date_of_birth.replace(/-/g, '');
        const dobMatch = ocrText.replace(/\D/g, '').includes(dobSimple);

        if (firstNameMatch && lastNameMatch && dobMatch && genderMatch) {
            matchFound = true;
            verificationDetails = "OCR data match successful.";
        } else {
            verificationDetails = "Could not verify face or text on the ID document.";
        }
    } else {
        verificationDetails = "Could not detect a clear face or any text on the ID document.";
    }

    return new Response(
      JSON.stringify({ match: matchFound, details: verificationDetails, similarity: similarityScore }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error('Function Error:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
