
  create table "public"."alarm_sounds" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "name" text not null,
    "file_path" text not null,
    "storage_url" text not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."alarm_sounds" enable row level security;


  create table "public"."app_config" (
    "key" text not null,
    "value" text not null,
    "description" text,
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."app_config" enable row level security;

alter table "public"."alarms" add column "play_sound" boolean default false;

alter table "public"."alarms" add column "play_warning_sound" boolean default false;

alter table "public"."alarms" add column "sound_id" uuid;

alter table "public"."alarms" add column "warning_sound_id" text;

alter table "public"."profile" add column "default_preset_sound_id" text;

alter table "public"."profile" add column "default_sound_id" uuid;

alter table "public"."profile" add column "warning_chime_id" text;

alter table "public"."profile" add column "warning_lead_minutes" integer default 3;

CREATE UNIQUE INDEX alarm_sounds_pkey ON public.alarm_sounds USING btree (id);

CREATE UNIQUE INDEX app_config_pkey ON public.app_config USING btree (key);

CREATE INDEX idx_alarm_sounds_user_id ON public.alarm_sounds USING btree (user_id);

alter table "public"."alarm_sounds" add constraint "alarm_sounds_pkey" PRIMARY KEY using index "alarm_sounds_pkey";

alter table "public"."app_config" add constraint "app_config_pkey" PRIMARY KEY using index "app_config_pkey";

alter table "public"."alarm_sounds" add constraint "alarm_sounds_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."alarm_sounds" validate constraint "alarm_sounds_user_id_fkey";

alter table "public"."alarms" add constraint "alarms_sound_id_fkey" FOREIGN KEY (sound_id) REFERENCES public.alarm_sounds(id) ON DELETE SET NULL not valid;

alter table "public"."alarms" validate constraint "alarms_sound_id_fkey";

alter table "public"."profile" add constraint "profile_default_sound_id_fkey" FOREIGN KEY (default_sound_id) REFERENCES public.alarm_sounds(id) ON DELETE SET NULL not valid;

alter table "public"."profile" validate constraint "profile_default_sound_id_fkey";

grant delete on table "public"."alarm_sounds" to "anon";

grant insert on table "public"."alarm_sounds" to "anon";

grant references on table "public"."alarm_sounds" to "anon";

grant select on table "public"."alarm_sounds" to "anon";

grant trigger on table "public"."alarm_sounds" to "anon";

grant truncate on table "public"."alarm_sounds" to "anon";

grant update on table "public"."alarm_sounds" to "anon";

grant delete on table "public"."alarm_sounds" to "authenticated";

grant insert on table "public"."alarm_sounds" to "authenticated";

grant references on table "public"."alarm_sounds" to "authenticated";

grant select on table "public"."alarm_sounds" to "authenticated";

grant trigger on table "public"."alarm_sounds" to "authenticated";

grant truncate on table "public"."alarm_sounds" to "authenticated";

grant update on table "public"."alarm_sounds" to "authenticated";

grant delete on table "public"."alarm_sounds" to "service_role";

grant insert on table "public"."alarm_sounds" to "service_role";

grant references on table "public"."alarm_sounds" to "service_role";

grant select on table "public"."alarm_sounds" to "service_role";

grant trigger on table "public"."alarm_sounds" to "service_role";

grant truncate on table "public"."alarm_sounds" to "service_role";

grant update on table "public"."alarm_sounds" to "service_role";

grant delete on table "public"."app_config" to "anon";

grant insert on table "public"."app_config" to "anon";

grant references on table "public"."app_config" to "anon";

grant select on table "public"."app_config" to "anon";

grant trigger on table "public"."app_config" to "anon";

grant truncate on table "public"."app_config" to "anon";

grant update on table "public"."app_config" to "anon";

grant delete on table "public"."app_config" to "authenticated";

grant insert on table "public"."app_config" to "authenticated";

grant references on table "public"."app_config" to "authenticated";

grant select on table "public"."app_config" to "authenticated";

grant trigger on table "public"."app_config" to "authenticated";

grant truncate on table "public"."app_config" to "authenticated";

grant update on table "public"."app_config" to "authenticated";

grant delete on table "public"."app_config" to "service_role";

grant insert on table "public"."app_config" to "service_role";

grant references on table "public"."app_config" to "service_role";

grant select on table "public"."app_config" to "service_role";

grant trigger on table "public"."app_config" to "service_role";

grant truncate on table "public"."app_config" to "service_role";

grant update on table "public"."app_config" to "service_role";


  create policy "Users can delete own sounds"
  on "public"."alarm_sounds"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "Users can insert own sounds"
  on "public"."alarm_sounds"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can view own sounds"
  on "public"."alarm_sounds"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Anyone can read config"
  on "public"."app_config"
  as permissive
  for select
  to public
using (true);



