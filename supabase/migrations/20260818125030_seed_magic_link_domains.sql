INSERT INTO "public"."app_config" ("key", "value", "description")
VALUES
  ('allowed_magic_link_domains', '["@example.com", "@test.com"]', 'JSON array of allowed domains for magic link logins. Use @domain.com format.'),
  ('Account_Creation', 'false', 'Enable or disable account creation. Set to true to allow.')
ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value";
