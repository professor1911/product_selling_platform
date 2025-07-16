-- Fix database function security by adding SET search_path = ''
-- This prevents search path manipulation attacks

-- 1. Fix handle_new_manufacturer_user function
CREATE OR REPLACE FUNCTION public.handle_new_manufacturer_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, role, approved)
  VALUES (NEW.id, 'manufacturer', false);
  RETURN NEW;
END;
$function$;

-- 2. Fix is_admin function  
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = user_uuid
  );
$function$;

-- 3. Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 4. Add secure admin creation function
CREATE OR REPLACE FUNCTION public.create_admin_user(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Only existing admins can create new admins
  IF NOT (SELECT public.is_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Access denied: Only admins can create admin users';
  END IF;
  
  -- Insert new admin user
  INSERT INTO public.admin_users (user_id, role, permissions)
  VALUES (target_user_id, 'admin', ARRAY['manage_manufacturers', 'manage_products', 'manage_leads', 'site_analytics']);
  
  RETURN true;
END;
$function$;

-- 5. Add RLS policies for admin_users INSERT
CREATE POLICY "Only admins can create admin users" 
ON public.admin_users 
FOR INSERT 
WITH CHECK (public.is_admin(auth.uid()));

-- 6. Add RLS policies for profiles INSERT  
CREATE POLICY "Only system can create profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (false); -- This will be handled by the trigger only

-- 7. Add audit logging table for admin actions
CREATE TABLE public.admin_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_table TEXT,
  target_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.admin_audit_log 
FOR SELECT 
USING (public.is_admin(auth.uid()));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" 
ON public.admin_audit_log 
FOR INSERT 
WITH CHECK (true);

-- 8. Add audit logging function
CREATE OR REPLACE FUNCTION public.log_admin_action(
  action_type TEXT,
  target_table_name TEXT DEFAULT NULL,
  target_record_id UUID DEFAULT NULL,
  old_data JSONB DEFAULT NULL,
  new_data JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_table,
    target_id,
    old_values,
    new_values
  ) VALUES (
    auth.uid(),
    action_type,
    target_table_name,
    target_record_id,
    old_data,
    new_data
  );
END;
$function$;