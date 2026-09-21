import createClient from "@/supabase/api";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { code, next = '/' } = req.query;

  if (code) {
    const supabase = createClient(req, res);
    
    // Exchange the auth code for a session token
    const { error } = await supabase.auth.exchangeCodeForSession(String(code));
    
    if (!error) {
      // Successfully exchanged code for session, redirect to desired page
      return res.redirect(302, next);
    } else {
      console.error('Error exchanging code for session:', error);
    }
  }

  // Fallback to error page or home page with error parameter
  return res.redirect(302, '/?error=auth_failed');
}
