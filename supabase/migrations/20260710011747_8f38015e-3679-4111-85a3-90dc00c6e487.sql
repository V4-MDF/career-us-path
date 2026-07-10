-- 1) Create private.has_role and grant execute
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, anon, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 2) Recreate all policies that referenced public.has_role → private.has_role

-- public.kv_records
DROP POLICY IF EXISTS "admins full kv" ON public.kv_records;
CREATE POLICY "admins full kv" ON public.kv_records
  AS PERMISSIVE FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

-- public.user_roles
DROP POLICY IF EXISTS "admins manage roles" ON public.user_roles;
CREATE POLICY "admins manage roles" ON public.user_roles
  AS PERMISSIVE FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

-- storage.objects (bucket 'media')
DROP POLICY IF EXISTS "admin insert media" ON storage.objects;
CREATE POLICY "admin insert media" ON storage.objects
  AS PERMISSIVE FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'media'
    AND private.has_role(auth.uid(), 'admin'::public.app_role)
  );

DROP POLICY IF EXISTS "admin update media" ON storage.objects;
CREATE POLICY "admin update media" ON storage.objects
  AS PERMISSIVE FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'media'
    AND private.has_role(auth.uid(), 'admin'::public.app_role)
  )
  WITH CHECK (
    bucket_id = 'media'
    AND private.has_role(auth.uid(), 'admin'::public.app_role)
  );

DROP POLICY IF EXISTS "admin delete media" ON storage.objects;
CREATE POLICY "admin delete media" ON storage.objects
  AS PERMISSIVE FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'media'
    AND private.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- 3) Drop the exposed public.has_role from the API schema
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

-- 4) Scope anon UPDATEs on kv_records to a client-owned token.
DROP POLICY IF EXISTS "anon update rolling collections" ON public.kv_records;
CREATE POLICY "anon update rolling collections" ON public.kv_records
  AS PERMISSIVE FOR UPDATE
  TO anon
  USING (
    table_name = ANY (ARRAY['sessions'::text, 'ab_stats'::text, 'leads_partial'::text])
    AND coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb ->> 'x-client-token' IS NOT NULL
    AND data ->> 'client_token' = (coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb ->> 'x-client-token')
  )
  WITH CHECK (
    table_name = ANY (ARRAY['sessions'::text, 'ab_stats'::text, 'leads_partial'::text])
    AND coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb ->> 'x-client-token' IS NOT NULL
    AND data ->> 'client_token' = (coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb ->> 'x-client-token')
  );