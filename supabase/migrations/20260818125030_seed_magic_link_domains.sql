INSERT INTO "public"."app_config" ("key", "value", "description")
VALUES
  ('blocked_magic_link_domains', '["@tempmail.com", "@10minutemail.com", "@mailinator.com", "@guerrillamail.com", "@yopmail.com"]', 'JSON array of blocked domains for magic link logins. Use @domain.com format.'),
  ('Account_Creation', 'false', 'Enable or disable account creation. Set to true to allow.')
ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value";
