-- Add policy to allow service role (backend) to read all feedback
CREATE POLICY "Service role can read all feedback" ON public.feedback
    FOR SELECT
    TO service_role
    USING (true);

-- Or if you want the backend to read all feedback using anon key, update the existing policy:
-- DROP POLICY "Users can see their own feedback" ON public.feedback;
-- CREATE POLICY "Anyone can read feedback" ON public.feedback
--     FOR SELECT USING (true);
