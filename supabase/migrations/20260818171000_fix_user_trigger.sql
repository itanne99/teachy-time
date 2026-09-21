CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
  first_name_val text;
  last_name_val text;
  full_name_val text;
BEGIN
  full_name_val := new.raw_user_meta_data->>'full_name';
  first_name_val := split_part(full_name_val, ' ', 1);
  
  IF position(' ' in full_name_val) > 0 THEN
    last_name_val := substring(full_name_val from position(' ' in full_name_val) + 1);
  ELSE
    last_name_val := '';
  END IF;

  insert into public.profile (user_id, email, created_by, first_name, last_name)
  values (new.id, new.email, new.id, first_name_val, last_name_val);
  
  insert into public.schedules (user_id, name)
  values (new.id, 'main');
  
  return new;
END;
$$;
