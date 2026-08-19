INSERT INTO "public"."app_config" ("key", "value", "description")
VALUES ('max_sounds_per_user', '10', 'Maximum custom alarm sounds a user can upload')
ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value";
