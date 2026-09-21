import createClient from "@/supabase/api";
import { getAppConfig } from "@/services/configService";
import { applyRateLimit } from "@/services/rateLimitService";
import { validateEmail } from "@/services/validationService";

export default async function handler(req, res) {
  if (!(await applyRateLimit(req, res, { limit: 10, windowMs: 60_000 }))) return;

  const { method, body } = req;

  if (method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  const supabase = createClient(req, res);

  const getURL = () => {
    let url = process?.env?.NEXT_PUBLIC_SITE_URL;
    if (!url && process?.env?.NEXT_PUBLIC_VERCEL_URL && !process.env.NEXT_PUBLIC_VERCEL_URL.includes('localhost')) {
      url = process.env.NEXT_PUBLIC_VERCEL_URL;
    }
    if (!url) {
      const protocol = req.headers['x-forwarded-proto'] || (req.headers.host?.includes('localhost') || req.headers.host?.includes('127.0.0.1') ? 'http' : 'https');
      url = `${protocol}://${req.headers.host}/`;
    }
    url = url.startsWith('http') ? url : `https://${url}`;
    url = url.endsWith('/') ? url : `${url}/`;
    return url;
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

    const emailDomain = email.slice(email.lastIndexOf("@") + 1).toLowerCase();
    
    // If we have a blocked list, enforce it
    if (blockedDomains && blockedDomains.includes(emailDomain)) {
      return res.status(403).json({ error: "Email domain not allowed for magic link login." });
    }

    const redirectUrl = getURL() + 'api/auth/callback';
    console.log('[Auth] Requesting magic link for:', email, 'with redirect:', redirectUrl);

    const { error } = await supabase.auth.signInWithOtp({ 
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: redirectUrl,
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
