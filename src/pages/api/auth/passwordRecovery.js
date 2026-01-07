import createClient from "@/supabase/api";

export default async function handler(req, res) {
  const { method, body } = req;

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

  switch (method) {
    case "POST": // Request password reset email
      try {
        const { email } = body;

        if (!email) {
          return res.status(400).json({ error: "Missing required field: email." });
        }

        const { data, error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: getURL() + 'Profile?reset=true' });

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
