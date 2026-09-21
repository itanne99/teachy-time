INSERT INTO "public"."app_config" ("key", "value", "description")
VALUES
  ('default_chime_url', 'https://mgsqrwnwppjmijenbfys.supabase.co/storage/v1/object/public/chimes/public/wind-chimes-37762.mp3', 'Default alarm chime sound URL'),
  ('default_warning_chime_url', 'https://mgsqrwnwppjmijenbfys.supabase.co/storage/v1/object/public/chimes/public/gentle-ding.mp3', 'Default warning chime sound URL'),
  ('max_label_length', '50', 'Maximum length of an alarm label'),
  ('max_schedule_name_length', '100', 'Maximum length of a schedule name')
ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value";
