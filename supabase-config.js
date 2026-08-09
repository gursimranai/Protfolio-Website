/* ====================================================================
   SUPABASE BACKEND CONFIGURATION
   ====================================================================
   Project ID: bufvzcvlmibayhwgvnsr
   Project URL: https://bufvzcvlmibayhwgvnsr.supabase.co
   ==================================================================== */

// Configuration Variables (Accessible globally)
window.SUPABASE_URL = window.SUPABASE_URL || "https://bufvzcvlmibayhwgvnsr.supabase.co";
window.SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "sb_publishable_8DgmPO1SztnTvRzFAHpWng_ffX-Vkg-";

// Initialize Supabase Client Instance
let supabaseClient = null;

function initSupabaseClient() {
  if (typeof supabase === 'undefined') {
    console.warn("[Supabase] SDK (@supabase/supabase-js) is not loaded.");
    return null;
  }

  const url = (window.SUPABASE_URL || "").trim();
  const anonKey = (window.SUPABASE_ANON_KEY || "").trim();

  if (!url) {
    console.warn("[Supabase] Missing SUPABASE_URL configuration.");
    return null;
  }

  if (!anonKey) {
    console.warn("[Supabase] Missing SUPABASE_ANON_KEY configuration.");
    return null;
  }

  try {
    supabaseClient = supabase.createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    console.log("[Supabase] Client initialized successfully for:", url);
    return supabaseClient;
  } catch (err) {
    console.error("[Supabase] Initialization error:", err.message);
    return null;
  }
}

// Auto-initialize client
initSupabaseClient();
