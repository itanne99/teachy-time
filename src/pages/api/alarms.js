import createClient from "@/supabase/api";
import supabaseService from "@/supabase/supabaseService";

export default async function handler(req, res) {
  const { method, query, body } = req;

  const daysOfWeekMap = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
  };

  const supabase = createClient(req, res);

  // Helper function to check for existing alarms
  const checkExistingAlarm = async (alarmIdentifier, user_id) => {
    let queryBuilder = supabase.from('alarms').select('*');

    if (alarmIdentifier.id) {
      queryBuilder = queryBuilder.eq('id', alarmIdentifier.id);
    } else if (alarmIdentifier.day_of_week && alarmIdentifier.time) {
      queryBuilder = queryBuilder
        .eq('day_of_week', alarmIdentifier.day_of_week)
        .eq('time', alarmIdentifier.time)
        .eq('user_id', user_id);
    } else {
      return { data: null, error: { message: 'Invalid alarm identifier provided.' } };
    }
    const { data, error } = await queryBuilder.single();
    return { data, error };
  };

  switch (method) {
    case 'POST': // Or POST for fetching with a body
      // Fetch alarms, optionally filtered by day
      try {
        const { user_id } = body;

        // If no user_id provided, return error
        if (!user_id) {
          return res.status(400).json({ error: 'User ID is required.' });
        }

        let queryBuilder = supabase.from('alarms').select('*');

        queryBuilder = queryBuilder.eq('user_id', user_id);

        const { data, error } = await queryBuilder.order('time', { ascending: true });

        if (data) {
          const transformedData = {
            'Sunday': [],
            'Monday': [],
            'Tuesday': [],
            'Wednesday': [],
            'Thursday': [],
            'Friday': [],
            'Saturday': [],
          };

          data.forEach(alarm => {
            const dayName = daysOfWeekMap[alarm.day_of_week];
            if (dayName) {
              transformedData[dayName].push(alarm);
            }
          });
          return res.status(200).json(transformedData);
        }

        if (error) {
          console.error('Supabase error:', error);
          return res.status(500).json({ error: error.message });
        }

        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({ error: 'An unexpected error occurred.', details: error.message });
      }
      break;

    case 'PUT':
      // Create a new alarm
      try {
        const { day_of_week, time, label, user_id } = body;

        // Check if required fields are present
        if (!day_of_week || !time || !label || !user_id) {
          return res.status(400).json({ error: 'Missing required fields: day_of_week, time, label, user_id.' });
        }

        // Check if user_id is a valid user_id
        const userExists = await supabaseService.auth.admin.getUserById(user_id);

        if(userExists.error){
          return res.status(500).json({ error: userExists.error.message });
        }

        if (!userExists.data) {
          return res.status(400).json({ error: 'Invalid user ID.' });
        }

        // Check if a user already has alarm at this time on this day
        const { data: existingAlarm, error: existingAlarmError } = await checkExistingAlarm({ day_of_week, time }, user_id);
        if (existingAlarmError && existingAlarmError.code !== 'PGRST116') { // PGRST116 means no rows found
          return res.status(500).json({ error: existingAlarmError.message });
        }
        if (existingAlarm) {
          return res.status(409).json({ error: 'An alarm at this time already exists for this user on this day.' });
        }

        const { data, error } = await supabase
          .from('alarms')
          .insert([{
            user_id:user_id,
            day_of_week: day_of_week,
            time: time,
            label: label }])
          .select()
          .single();

        if (error) {
          console.error('Supabase error:', error);
          return res.status(500).json({ error: error.message });
        }

        res.status(201).json(data);
      } catch (error) {
        res.status(500).json({ error: 'An unexpected error occurred.', details: error.message });
      }
      break;

    case 'PATCH':
      // Update an existing alarm
      try {
        const { id, time, label } = body;
        if (!id) {
          return res.status(400).json({ error: 'Alarm ID is required.' });
        }

        const { data: alarmToUpdate, error: alarmToUpdateError } = await checkExistingAlarm({ id });

        if (alarmToUpdateError) {
          if (alarmToUpdateError.code === 'PGRST116') { // No rows found
            return res.status(404).json({ error: 'Alarm not found.' });
          }
          console.error('Supabase error:', alarmToUpdateError);
          return res.status(500).json({ error: alarmToUpdateError.message });
        }

        if(!time || !label){
          return res.status(400).json({ error: 'No update data provided.' });
        }

        // Check for conflict: if time or day_of_week is being updated, ensure no existing alarm at the new time/day
        if (time !== alarmToUpdate.time || label !== alarmToUpdate.label) {
          const { data: conflictingAlarm, error: conflictError } = await checkExistingAlarm({ day_of_week: alarmToUpdate.day_of_week, time }, alarmToUpdate.user_id);
          if (conflictingAlarm && conflictingAlarm.id !== id) {
            return res.status(409).json({ error: 'An alarm at this time already exists for this user on this day.' });
          }
        }
        const { data, error } = await supabase
          .from('alarms')
          .update({ time: time, label: label })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Supabase error:', error);
          return res.status(500).json({ error: error.message });
        }

        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({ error: 'An unexpected error occurred.', details: error.message });
      }
      break;

    case 'DELETE':
      // Delete an alarm
      try {
        const { id } = body;
        if (!id) {
          return res.status(400).json({ error: 'Alarm ID is required.' });
        }

        const { data: alarmToDelete, error: alarmToDeleteError } = await checkExistingAlarm({ id });

        if (alarmToDeleteError) {
          if (alarmToDeleteError.code === 'PGRST116') { // No rows found
            return res.status(404).json({ error: 'Alarm not found.' });
          }
          console.error('Supabase error:', alarmToDeleteError);
          return res.status(500).json({ error: alarmToDeleteError.message });
        }

        const { error } = await supabase
          .from('alarms')
          .delete()
          .eq('id', id);

        if (error) {
          return res.status(500).json({ error: error.message });
        }

        res.status(200).end(); // Delete successful, no content to return
      } catch (error) {
        res.status(500).json({ error: 'An unexpected error occurred.', details: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['POST', 'PUT', 'PATCH', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
