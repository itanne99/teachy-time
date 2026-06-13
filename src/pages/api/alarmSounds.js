import createClient from "@/supabase/api";
import supabaseService from "@/supabase/supabaseService";
import { getAppConfig } from "@/services/configService";

const ALLOWED_TYPES = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/x-wav", "audio/mp3"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

async function getAuthUserId(req, res) {
  const supabase = createClient(req, res);
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return { userId: null, error: "Unauthorized" };
  }
  return { userId: user.id, error: null };
}

export default async function handler(req, res) {
  const { method, query, body } = req;
  const supabase = createClient(req, res);

  const { userId, error: authError } = await getAuthUserId(req, res);
  if (authError) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  switch (method) {
    case "GET":
      try {
        const { affectedCount, id } = query;

        if (affectedCount === "true" && id) {
          const { data, error } = await supabase
            .from("alarms")
            .select("id", { count: "exact", head: true })
            .eq("sound_id", id)
            .eq("user_id", userId);
          if (error) throw error;
          return res.status(200).json({ affectedAlarms: data?.length || 0 });
        }

        const [{ data: sounds, error: soundsError }, { data: profile }, config] = await Promise.all([
          supabase.from("alarm_sounds").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
          supabase.from("profile").select("default_sound_id").eq("user_id", userId).single(),
          getAppConfig(supabase),
        ]);
        const maxSounds = config.max_sounds_per_user;

        if (soundsError) throw soundsError;

        return res.status(200).json({
          sounds: sounds || [],
          defaultSoundId: profile?.default_sound_id || null,
          maxSounds,
        });
      } catch (error) {
        console.error("GET /api/alarmSounds error:", error);
        return res.status(500).json({ error: error.message });
      }

    case "POST":
      try {
        const { name, fileData, fileType } = body;

        if (!name || !fileData || !fileType) {
          return res.status(400).json({ error: "Missing required fields: name, fileData, fileType" });
        }

        let ext = fileType.split("/")[1]?.replace("x-", "") || "mp3";
        if (ext === "mpeg") {
          ext = "mp3";
        }
        const allowedExts = ["mp3", "wav", "ogg"];
        if (!allowedExts.includes(ext)) {
          return res.status(400).json({ error: `Invalid file type. Allowed: ${allowedExts.join(", ")}` });
        }

        const buffer = Buffer.from(fileData, "base64");
        if (buffer.length > MAX_FILE_SIZE) {
          return res.status(400).json({ error: "File exceeds 5MB limit" });
        }

        const [{ count: existingCount, error: countError }, config] = await Promise.all([
          supabase.from("alarm_sounds").select("id", { count: "exact", head: true }).eq("user_id", userId),
          getAppConfig(supabase),
        ]);
        const maxSounds = config.max_sounds_per_user;

        if (countError) throw countError;
        if ((existingCount || 0) >= maxSounds) {
          return res.status(400).json({ error: `Maximum sounds reached (${maxSounds}). Delete one to upload a new sound.` });
        }

        const soundId = crypto.randomUUID();
        const filePath = `user-sounds/${userId}/${soundId}.${ext}`;

        const { error: uploadError } = await supabaseService.storage
          .from("chimes")
          .upload(filePath, buffer, { contentType: fileType, upsert: false });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabaseService.storage
          .from("chimes")
          .getPublicUrl(filePath);

        const { data: sound, error: insertError } = await supabase
          .from("alarm_sounds")
          .insert([{ user_id: userId, name, file_path: filePath, storage_url: publicUrl }])
          .select()
          .single();

        if (insertError) throw insertError;

        return res.status(201).json({ sound });
      } catch (error) {
        console.error("POST /api/alarmSounds error:", error);
        return res.status(500).json({ error: error.message });
      }

    case "DELETE":
      try {
        const { id } = body;
        if (!id) {
          return res.status(400).json({ error: "Sound ID is required" });
        }

        const { data: sound, error: fetchError } = await supabase
          .from("alarm_sounds")
          .select("*")
          .eq("id", id)
          .eq("user_id", userId)
          .single();

        if (fetchError) {
          if (fetchError.code === "PGRST116") {
            return res.status(404).json({ error: "Sound not found" });
          }
          throw fetchError;
        }

        const { data: affectedAlarms, error: alarmsError } = await supabase
          .from("alarms")
          .select("id")
          .eq("sound_id", id);

        if (alarmsError) throw alarmsError;

        await supabase
          .from("alarms")
          .update({ sound_id: null })
          .eq("sound_id", id)
          .eq("user_id", userId);

        await supabase
          .from("profile")
          .update({ default_sound_id: null })
          .eq("default_sound_id", id)
          .eq("user_id", userId);

        await supabaseService.storage
          .from("chimes")
          .remove([sound.file_path]);

        const { error: deleteError } = await supabase
          .from("alarm_sounds")
          .delete()
          .eq("id", id)
          .eq("user_id", userId);

        if (deleteError) throw deleteError;

        return res.status(200).json({ deletedId: id, affectedAlarms: affectedAlarms?.length || 0 });
      } catch (error) {
        console.error("DELETE /api/alarmSounds error:", error);
        return res.status(500).json({ error: error.message });
      }

    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
