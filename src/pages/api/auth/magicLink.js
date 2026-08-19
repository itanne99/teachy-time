import createClient from "@/supabase/api";
import { getAppConfig } from "@/services/configService";
import { applyRateLimit } from "@/services/rateLimitService";
import { validateEmail } from "@/services/validationService";

export default async function handler(req, res) {
  if (!applyRateLimit(req, res, { limit: 10, windowMs: 60_000 })) return;

  const { method, body } = req;

  if (method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  const supabase = createClient(req, res);

  const getURL = () => {
    let url =
      process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
      process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
      'http://localhost:3000/'

    // Make sure to include `https://` when not localhost.
    url = url.startsWith('http') ? url : `https://${url}`
    // Make sure to include a trailing `/`.
    url = url.endsWith('/') ? url : `${url}/`
    return url
  }

  try {
    const { email } = body;

    if (!email) {
      return res.status(400).json({ error: "Missing required field: email." });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    // Get blocked domains from config
    const config = await getAppConfig(supabase);
    let blockedDomains = [];
    
    try {
      if (typeof config.blocked_magic_link_domains === 'string') {
        blockedDomains = JSON.parse(config.blocked_magic_link_domains);
      } else if (Array.isArray(config.blocked_magic_link_domains)) {
        blockedDomains = config.blocked_magic_link_domains;
      }
    } catch (e) {
      console.error("Failed to parse allowed domains", e);
    }

    const emailDomain = email.slice(email.lastIndexOf("@"));
    
    // If we have a blocked list, enforce it
    if (blockedDomains && blockedDomains.includes(emailDomain)) {
      return res.status(403).json({ error: "Email domain not allowed for magic link login." });
    }

    const { error } = await supabase.auth.signInWithOtp({ 
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: getURL(),
      }
    });

    if (error) {
      throw error;
    }

    res.status(200).json({ message: "Magic link sent successfully." });
  } catch (error) {
    console.error("Magic link error:", error);
    res.status(error.status || 500).json({
      error: error.message || "An unexpected error occurred.",
      message: error.message || "An unexpected error occurred.",
    });
  }
}
