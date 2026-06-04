import createClient from "@/supabase/api";

async function getAuthUserId(req, res) {
  const supabase = createClient(req, res);
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return { userId: null, error: 'Unauthorized' };
  }
  return { userId: user.id, error: null };
}

export default async function handler(req, res) {
  const { method, body } = req;
  const supabase = createClient(req, res);

  const { userId, error: authError } = await getAuthUserId(req, res);
  if (authError) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  switch (method) {
    case 'POST':
      try {
        const { data, error } = await supabase
          .from('schedules')
          .select('*')
          .eq('user_id', userId)
          .order('name', { ascending: true });

        if (error) throw error;
        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'PUT':
      try {
        const { name } = body;
        if (!name) return res.status(400).json({ error: 'Name is required.' });

        const { data, error } = await supabase
          .from('schedules')
          .insert([{ user_id: userId, name }])
          .select()
          .single();

        if (error) throw error;
        res.status(201).json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'PATCH':
      try {
        const { id, name } = body;
        if (!id || !name) return res.status(400).json({ error: 'ID and Name are required.' });

        const { data: existingSchedule, error: fetchError } = await supabase
          .from('schedules')
          .select('user_id')
          .eq('id', id)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            res.status(404).json({ error: 'Schedule not found.' });
            return;
          }
          throw fetchError;
        }

        if (existingSchedule.user_id !== userId) {
          res.status(403).json({ error: 'Forbidden: You do not own this schedule.' });
          return;
        }

        const { data, error } = await supabase
          .from('schedules')
          .update({ name })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'DELETE':
      try {
        const { id } = body;
        if (!id) return res.status(400).json({ error: 'ID is required.' });

        const { data: schedule, error: fetchError } = await supabase
          .from('schedules')
          .select('user_id, name')
          .eq('id', id)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            res.status(404).json({ error: 'Schedule not found.' });
            return;
          }
          throw fetchError;
        }

        if (schedule.user_id !== userId) {
          res.status(403).json({ error: 'Forbidden: You do not own this schedule.' });
          return;
        }

        if (schedule.name.toLowerCase() === 'main') {
          return res.status(403).json({ error: 'Cannot delete the Main schedule.' });
        }

        const { error: deleteError } = await supabase
          .from('schedules')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;
        res.status(200).end();
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['POST', 'PUT', 'PATCH', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
