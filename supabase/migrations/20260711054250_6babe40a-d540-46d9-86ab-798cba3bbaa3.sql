
-- 1. Create a private schema not exposed to the API
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO postgres, service_role;

-- 2. Recreate has_role in private schema
CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;

-- 3. Helper: highest active/approved subscription tier for user
CREATE OR REPLACE FUNCTION private.user_tier(_user_id uuid)
RETURNS int
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(MAX(p.tier), 0)
  FROM public.subscriptions s
  JOIN public.plans p ON p.id = s.plan_id
  WHERE s.user_id = _user_id
    AND s.approved = true
    AND s.status = 'active';
$$;
REVOKE ALL ON FUNCTION private.user_tier(uuid) FROM PUBLIC;

-- 4. Drop and recreate policies referencing public.has_role
-- user_roles
DROP POLICY IF EXISTS "users read own roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins manage roles" ON public.user_roles;
CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT
  USING ((user_id = auth.uid()) OR private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

-- profiles
DROP POLICY IF EXISTS "users read own profile" ON public.profiles;
DROP POLICY IF EXISTS "users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "admins delete profile" ON public.profiles;
CREATE POLICY "users read own profile" ON public.profiles FOR SELECT
  USING ((id = auth.uid()) OR private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "users update own profile" ON public.profiles FOR UPDATE
  USING ((id = auth.uid()) OR private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins delete profile" ON public.profiles FOR DELETE
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- plans
DROP POLICY IF EXISTS "public read active plans" ON public.plans;
DROP POLICY IF EXISTS "admins manage plans" ON public.plans;
CREATE POLICY "public read active plans" ON public.plans FOR SELECT
  USING ((active = true) OR private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins manage plans" ON public.plans FOR ALL
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

-- orders
DROP POLICY IF EXISTS "users read own orders" ON public.orders;
DROP POLICY IF EXISTS "users update own pending orders" ON public.orders;
CREATE POLICY "users read own orders" ON public.orders FOR SELECT
  USING ((user_id = auth.uid()) OR private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "users update own pending orders" ON public.orders FOR UPDATE
  USING ((user_id = auth.uid()) OR private.has_role(auth.uid(), 'admin'::public.app_role));

-- subscriptions
DROP POLICY IF EXISTS "users read own subs" ON public.subscriptions;
DROP POLICY IF EXISTS "admins update subs" ON public.subscriptions;
CREATE POLICY "users read own subs" ON public.subscriptions FOR SELECT
  USING ((user_id = auth.uid()) OR private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins update subs" ON public.subscriptions FOR UPDATE
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

-- site_settings — restrict public reads to an allow-list of keys
DROP POLICY IF EXISTS "admins manage settings" ON public.site_settings;
DROP POLICY IF EXISTS "public read site settings" ON public.site_settings;
CREATE POLICY "admins manage settings" ON public.site_settings FOR ALL
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "public read allow-listed settings" ON public.site_settings FOR SELECT
  USING (key IN ('contact_email','contact_phone','contact_address','about_html','hero_title','hero_subtitle'));

-- tutorial_questions
DROP POLICY IF EXISTS "admins manage tutorial" ON public.tutorial_questions;
CREATE POLICY "admins manage tutorial" ON public.tutorial_questions FOR ALL
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

-- practice_questions — gate by subscription tier
DROP POLICY IF EXISTS "admins manage practice" ON public.practice_questions;
DROP POLICY IF EXISTS "authenticated read practice" ON public.practice_questions;
CREATE POLICY "admins manage practice" ON public.practice_questions FOR ALL
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "subscribers read practice by tier" ON public.practice_questions FOR SELECT
  TO authenticated
  USING (
    private.has_role(auth.uid(), 'admin'::public.app_role)
    OR private.user_tier(auth.uid()) >= min_tier
  );

-- quiz_attempts — restrict inserts to authenticated users writing their own row
DROP POLICY IF EXISTS "insert attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "read own attempts" ON public.quiz_attempts;
CREATE POLICY "insert own attempts" ON public.quiz_attempts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "read own attempts" ON public.quiz_attempts FOR SELECT
  USING ((user_id = auth.uid()) OR private.has_role(auth.uid(), 'admin'::public.app_role));

-- contact_messages
DROP POLICY IF EXISTS "admins read messages" ON public.contact_messages;
DROP POLICY IF EXISTS "admins update messages" ON public.contact_messages;
CREATE POLICY "admins read messages" ON public.contact_messages FOR SELECT
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins update messages" ON public.contact_messages FOR UPDATE
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

-- 5. Drop the public has_role now that no policy references it
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

-- 6. Revoke EXECUTE on the trigger function from API roles (only used by the auth trigger)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
