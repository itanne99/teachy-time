import createClient from "@/supabase/api";
import { getAppConfig } from "@/services/configService";

export default async function handler(req, res) {
  const { method, body } = req;

  if (method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  const supabase = createClient(req, res);

  try {
    const config = await getAppConfig(supabase);
    if (config.Account_Creation === false) {
      return res.status(403).json({ error: "Account creation is currently disabled." });
    }

    const { email, password, full_name } = body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: "Missing required fields: email, password, full_name." });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
        }
      }
    });

    if (error) {
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(error.status || 500).json({
      ...error,
      message: error.message || "An unexpected error occurred.",
    });
  }
}
