import createClient from "@/supabase/api";

export default async function handler(req, res) {
  const { method } = req;

  const supabase = createClient(req, res);
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("Supabase auth error:", userError);
    return res.status(500).json({ error: userError.message });
  }

  if (!user) {
    return res.status(401).json({ error: "Unauthorized: No active session." });
  }

  switch (method) {
    case "GET":
      try {
        const lookupUserId = req.query.user_id || user.id;
        let { data, error } = await getUserProfile(supabase, lookupUserId);

        // If an error does occur that is NOT "no rows found", throw it.
        if (error && error?.code !== "PGRST116") throw error;

        if(error && error?.code === "PGRST116"){
          // return 404 if no profile found
          return res.status(404).json({ error: "User profile not found." });
        }

        // If a profile exists, return it.
        if (data) {
          return res.status(200).json(data);
        }
      } catch (error) {
        console.error("Supabase GET error:", error);
        res.status(500).json({ error: error.message });
      }
      break;

    case "PATCH":
      try {
        const { first_name, last_name, user_id } = req.body;

        if (!first_name && !last_name && !user_id) {
          return res.status(400).json({ error: "All fields are required. first_name, last_name, user_id" });
        }

        const updates = {
          user_id: user_id,
          first_name: first_name,
          last_name: last_name,
        };

        const data = await updateUserProfile(supabase, user.id, updates);

        res.status(200).json(data);
      } catch (error) {
        console.error("Supabase PATCH error:", error);
        res.status(500).json({ error: error.message });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "PATCH"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

async function getUserProfile(supabase, userId) {
  return await supabase.from("profile").select("*").eq("user_id", userId).single();
}

async function updateUserProfile(supabase, userId, updates) {
  const { data: user, error } = await supabase
    .from("profile")
    .update({
      first_name: updates.first_name,
      last_name: updates.last_name,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", updates.user_id)
    .select()
    .single();

  if (error) {
    throw error;
  }
  return user;
}
