
DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated','authenticated',
    'otaviohenrique@v4company.com',
    crypt('goto200k', gen_salt('bf')),
    now(), now(), now(),
    jsonb_build_object('provider','email','providers',jsonb_build_array('email')),
    '{}'::jsonb,
    false
  );
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), new_user_id,
    jsonb_build_object('sub', new_user_id::text, 'email', 'otaviohenrique@v4company.com', 'email_verified', true),
    'email', 'otaviohenrique@v4company.com', now(), now(), now());
  INSERT INTO public.user_roles (user_id, role) VALUES (new_user_id, 'admin')
    ON CONFLICT DO NOTHING;
END $$;
