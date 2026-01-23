import createClient from "@/supabase/api";

export default async function handler(req, res) {
  const { method, body } = req;
  const supabase = createClient(req, res);

  switch (method) {
    case 'POST': // Fetch all schedules for a user
      try {
        const { user_id } = body;
        if (!user_id) return res.status(400).json({ error: 'User ID is required.' });

        const { data, error } = await supabase
          .from('schedules')
          .select('*')
          .eq('user_id', user_id)
          .order('name', { ascending: true });

        if (error) throw error;
        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'PUT': // Create a new schedule
      try {
        const { user_id, name } = body;
        if (!user_id || !name) return res.status(400).json({ error: 'User ID and Name are required.' });

        const { data, error } = await supabase
          .from('schedules')
          .insert([{ user_id, name }])
          .select()
          .single();

        if (error) throw error;
        res.status(201).json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'PATCH': // Rename a schedule
      try {
        const { id, name } = body;
        if (!id || !name) return res.status(400).json({ error: 'ID and Name are required.' });

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

    case 'DELETE': // Delete a schedule
      try {
        const { id } = body;
        if (!id) return res.status(400).json({ error: 'ID is required.' });

        // Check if it's the "Main" schedule
        const { data: schedule, error: fetchError } = await supabase
          .from('schedules')
          .select('name')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
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
