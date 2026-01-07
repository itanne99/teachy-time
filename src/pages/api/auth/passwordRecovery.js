import createClient from "@/supabase/api";

export default async function handler(req, res) {
  const { method, body } = req;

  const supabase = createClient(req, res);

  switch (method) {
    case "POST": // Request password reset email
      try {
        const { email } = body;

        if (!email) {
          return res.status(400).json({ error: "Missing required field: email." });
        }

        // The redirectTo URL is where the user will be sent after clicking the link in the email.
        // This should be a client-side route where they can enter a new password.
        // Supabase will append access_token and refresh_token to this URL.
        // Ensure NEXT_PUBLIC_BASE_URL is set in your environment variables (e.g., .env.local).
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/Profile?reset=true`, // Example client-side route
        });

        if (error) {
          throw error;
        }

        res.status(200).json({ data, message: "Password reset email sent successfully." });
      } catch (error) {
        res.status(error.status || 500).json({
          ...error,
          message: error.message,
        });
      }
      break;
    case "PATCH": // Update password after reset
      try {
        const { password, code } = body;

        if (!password) {
          return res.status(400).json({ error: "Missing required field: password." });
        }

        // This endpoint assumes the user has already clicked the reset link
        // and their session has been set on the client-side using the token from the URL.
        // Therefore, the user is already authenticated when this request is made.
        const { data, error } = await supabase.auth.updateUser({
          password: password,
          captchaToken: code || undefined, // Optional, if you want to verify captcha
        });

        if (error) {
          throw error;
        }

        res.status(200).json({ message: "Password updated successfully." });
      } catch (error) {
        res.status(error.status || 500).json({
          ...error,
          message: error.message,
        });
      }
      break;
    default:
      res.setHeader("Allow", ["POST", "PATCH"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
