import createClient from "@/supabase/api";
import { getAppConfig } from "@/services/configService";
import { applyRateLimit } from "@/services/rateLimitService";
import { sanitizeString, validateEmail } from "@/services/validationService";

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
    const config = await getAppConfig(supabase);
    if (config.Account_Creation === false) {
      return res.status(403).json({ error: "Account creation is currently disabled." });
    }

    const { email, password, full_name } = body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: "Missing required fields: email, password, full_name." });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    const sanitizedFullName = sanitizeString(full_name, 100);
    if (!sanitizedFullName) {
      return res.status(400).json({ error: "Full name cannot be empty." });
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: getURL() + 'api/auth/callback',
        data: {
          full_name: sanitizedFullName,
        }
      }
    });

    if (error) {
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Signup error:", error);
    res.status(error.status || 500).json({
      error: error.message || "An unexpected error occurred.",
      message: error.message || "An unexpected error occurred.",
    });
  }
}
