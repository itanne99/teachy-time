import createClient from "@/supabase/api";
import { applyRateLimit } from "@/services/rateLimitService";
import { validateEmail } from "@/services/validationService";

export default async function handler(req, res) {
  if (!(await applyRateLimit(req, res, { limit: 10, windowMs: 60_000 }))) return;

  const { method, body } = req;

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

  switch (method) {
    case "POST": // Request password reset email
      try {
        const { email } = body;

        if (!email) {
          return res.status(400).json({ error: "Missing required field: email." });
        }

        if (!validateEmail(email)) {
          return res.status(400).json({ error: "Invalid email format." });
        }

        const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: getURL() + 'api/auth/callback?next=/reset-password' });

        if (error) {
          throw error;
        }

        res.status(200).json({ data, message: "Password reset email sent successfully." });
      } catch (error) {
        console.error("Password recovery POST error:", error);
        res.status(error.status || 500).json({
          error: error.message || "An unexpected error occurred.",
          message: error.message || "An unexpected error occurred.",
        });
      }
      break;
    case "PATCH": // Update password after reset
      try {
        const { password, code } = body;

        if (!password) {
          return res.status(400).json({ error: "Missing required field: password." });
        }

        if (typeof password !== 'string' || password.length < 6) {
          return res.status(400).json({ error: "Password must be at least 6 characters long." });
        }

        if (!code) {
          return res.status(400).json({ error: "Missing required field: code." });
        }

        // 1. Exchange the PKCE code for a session
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(String(code));
        
        if (exchangeError) {
          return res.status(401).json({ error: "Invalid or expired password reset link." });
        }

        // 2. Update the user's password
        const { error: updateError } = await supabase.auth.updateUser({
          password: password,
        });

        if (updateError) {
          throw updateError;
        }

        // 3. Immediately sign out to prevent auto-login
        await supabase.auth.signOut();

        res.status(200).json({ message: "Password updated successfully." });
      } catch (error) {
        console.error("Password recovery PATCH error:", error);
        res.status(error.status || 500).json({
          error: error.message || "An unexpected error occurred.",
          message: error.message || "An unexpected error occurred.",
        });
      }
      break;
    default:
      res.setHeader("Allow", ["POST", "PATCH"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
