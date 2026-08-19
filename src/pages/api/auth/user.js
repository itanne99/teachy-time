import createClient from "@/supabase/api";
import { applyRateLimit } from "@/services/rateLimitService";
import { validateEmail } from "@/services/validationService";

export default async function handler(req, res) {
  if (!applyRateLimit(req, res, { limit: 10, windowMs: 60_000 })) return;

  const { method, body } = req;

  const supabase = createClient(req, res);

  switch (method) {
    case "GET":
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }
        res.status(200).json(data);
      } catch (error) {
        res.status(error.status || 500).json({
          ...error,
          message: error.message,
        });
      }
      break;
    case "POST":
      try {
        const { user_email, password } = body;

        if (!user_email || !password) {
          return res.status(400).json({ error: "Missing required fields: user_email, password." });
        }

        if (!validateEmail(user_email)) {
          return res.status(400).json({ error: "Invalid email format." });
        }

        const signInResponse = await supabase.auth.signInWithPassword({
          email: user_email.trim().toLowerCase(),
          password: password,
        });

        if (signInResponse.error) {
          throw signInResponse.error;
        }

        res.status(200).json(signInResponse.data);
      } catch (error) {
        res.status(error.status || 500).json({ ...error, message: error.message });
      }
      break;
    case "DELETE":
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          throw error;
        }
        res.status(200).end(); // Sign-out successful, no content to return
      } catch (error) {
        res.status(error.status || 500).json({
          ...error,
          message: error.message,
        });
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
