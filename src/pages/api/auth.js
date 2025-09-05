import supabase from "@/db/supabase";

export default async function handler(req, res) {
  const { method, query, body } = req;

  switch (method) {
    case "GET":
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          return res.status(500).json({ error: error.message });
        }
        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({
            error: "An unexpected error occurred.",
            details: error.message,
          });
      }
      break;
    case "POST":
      try {
        const { user_email, password } = body;

        if (!user_email || !password) {
          return res.status(400).json({ error: "Missing required fields: user_email, password." });
        }
        const signInResponse = await supabase.auth.signInWithPassword({
          email: user_email,
          password: password,
        });

        if (signInResponse.error) {
          return res.status(500).json({ error: error.message });
        }

        const setSessionResponse = await supabase.auth.setSession({
          access_token: signInResponse.data.session.access_token,
          refresh_token: signInResponse.data.session.refresh_token
        });

        if(setSessionResponse.error){
          return res.status(500).json({ error: setSessionResponse.error.message });
        }

        res.status(200).json(signInResponse.data);
      } catch (error) {
        res.status(500).json({
            error: "An unexpected error occurred.",
            details: error.message,
          });
      }
      break;
    case "DELETE":
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          return res.status(500).json({ error: error.message });
        }
        res.status(200).end(); // Sign-out successful, no content to return
      } catch (error) {
        res.status(500).json({
            error: "An unexpected error occurred.",
            details: error.message,
          });
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
