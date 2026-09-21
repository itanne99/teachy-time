import createClient from "@/supabase/api";
import { applyRateLimit } from "@/services/rateLimitService";
import { sanitizeString, validateUUID } from "@/services/validationService";

export default async function handler(req, res) {
  if (!applyRateLimit(req, res, { limit: 100, windowMs: 60_000 })) return;

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
        if (req.query.user_id && !validateUUID(req.query.user_id)) {
          return res.status(400).json({ error: "Invalid user_id format." });
        }

        let { data, error } = await getUserProfile(supabase, lookupUserId);

        // If an error does occur that is NOT "no rows found", throw it.
        if (error && error?.code !== "PGRST116") throw error;

        if (error && error?.code === "PGRST116") {
          // return 404 if no profile found
          return res.status(404).json({ error: "User profile not found." });
        }

        // If a profile exists, return it.
        if (data) {
          let defaultSoundUrl = null;
          if (data.default_sound_id) {
            const { data: soundData } = await supabase
              .from("alarm_sounds")
              .select("storage_url")
              .eq("id", data.default_sound_id)
              .eq("user_id", lookupUserId)
              .single();
            defaultSoundUrl = soundData?.storage_url || null;
          }
          return res.status(200).json({
            ...data,
            default_sound_url: defaultSoundUrl,
            default_preset_sound_id: data.default_preset_sound_id || null,
          });
        }
      } catch (error) {
        console.error("Supabase GET error:", error);
        res.status(500).json({ error: error.message });
      }
      break;

    case "PATCH":
      try {
        const { first_name, last_name, user_id, default_sound_id, default_preset_sound_id, warning_lead_minutes, warning_chime_id } = req.body;

        if (!first_name && !last_name && !user_id && default_sound_id === undefined && default_preset_sound_id === undefined && warning_lead_minutes === undefined && warning_chime_id === undefined) {
          return res.status(400).json({ error: "All fields are required. first_name, last_name, user_id, default_sound_id, default_preset_sound_id, warning_lead_minutes, or warning_chime_id" });
        }

        const targetUserId = user_id || user.id;
        if (targetUserId && !validateUUID(targetUserId)) {
          return res.status(400).json({ error: "Invalid user_id format." });
        }

        if (warning_lead_minutes !== undefined) {
          const leadMinutes = Number(warning_lead_minutes);
          if (!Number.isInteger(leadMinutes) || leadMinutes < 1 || leadMinutes > 60) {
            return res.status(400).json({ error: "warning_lead_minutes must be an integer between 1 and 60." });
          }
        }

        const updates = {
          user_id: targetUserId,
          first_name: first_name !== undefined ? sanitizeString(first_name, 50) : undefined,
          last_name: last_name !== undefined ? sanitizeString(last_name, 50) : undefined,
        };

        if (default_sound_id !== undefined) {
          updates.default_sound_id = default_sound_id;
          updates.default_preset_sound_id = null;
        }
        if (default_preset_sound_id !== undefined) {
          updates.default_preset_sound_id = default_preset_sound_id;
          updates.default_sound_id = null;
        }
        if (warning_lead_minutes !== undefined) {
          updates.warning_lead_minutes = Number(warning_lead_minutes);
        }
        if (warning_chime_id !== undefined) {
          updates.warning_chime_id = warning_chime_id;
        }

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
      default_sound_id: updates.default_sound_id,
      default_preset_sound_id: updates.default_preset_sound_id,
      warning_lead_minutes: updates.warning_lead_minutes,
      warning_chime_id: updates.warning_chime_id,
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
