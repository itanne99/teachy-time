import createClient from "@/supabase/api";

export default async function handler(req, res) {
  const { method, query, body } = req;

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
        res.status(error.status).json({
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
        const signInResponse = await supabase.auth.signInWithPassword({
          email: user_email,
          password: password,
        });

        if (signInResponse.error) {
          throw signInResponse.error;
        }

        res.status(200).json(signInResponse.data);
      } catch (error) {
        res.status(error.status).json({...error, message: error.message});
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
        res.status(error.status).json({
            ...error,
            message: error.message,
          });
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "POST", "PATCH", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
