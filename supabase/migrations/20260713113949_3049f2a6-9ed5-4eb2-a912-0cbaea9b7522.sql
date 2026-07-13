
CREATE POLICY "book covers public read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'book-covers');
CREATE POLICY "book covers admin insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'book-covers' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "book covers admin update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'book-covers' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "book covers admin delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'book-covers' AND public.has_role(auth.uid(), 'admin'));
