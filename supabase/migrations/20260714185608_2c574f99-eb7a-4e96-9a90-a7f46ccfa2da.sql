
CREATE POLICY "admin_all_protected_files_objects" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'protected-files' AND private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (bucket_id = 'protected-files' AND private.has_role(auth.uid(), 'admin'::app_role));
