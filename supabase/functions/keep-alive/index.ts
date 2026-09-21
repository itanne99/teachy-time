import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

console.log("Keep-alive function started!");

Deno.serve(async (req) => {
  // Check the custom secret to ensure only authorized callers can run this
  const reqSecret = req.headers.get("x-keep-alive-secret");
  const envSecret = Deno.env.get("KEEP_ALIVE_SECRET");
  
  if (!envSecret || reqSecret !== envSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { 
      status: 401, 
      headers: { "Content-Type": "application/json" } 
    });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Run a tiny query to keep the DB active.
    // Even if RLS blocks the read and returns an empty array, the DB receives the activity.
    const { data, error } = await supabaseClient
      .from("app_config")
      .select("*")
      .limit(1);

    if (error) {
      console.error("Query error:", error);
      throw error;
    }

    return new Response(
      JSON.stringify({ message: "Database pinged successfully!", time: new Date().toISOString(), data }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});
