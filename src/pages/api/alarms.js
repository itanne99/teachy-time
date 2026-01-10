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
    } else if (alarmIdentifier.day_of_week && alarmIdentifier.start_time && alarmIdentifier.end_time) { // Updated condition to use start_time and end_time
      queryBuilder = queryBuilder
        .eq('day_of_week', alarmIdentifier.day_of_week)
        .eq('start_time', alarmIdentifier.start_time) // Use start_time
        .eq('end_time', alarmIdentifier.end_time)   // Use end_time
        .eq('user_id', user_id);
    } else {
      return { data: null, error: { message: 'Invalid alarm identifier provided.' } };
    }
    const { data, error } = await queryBuilder.single();
    return { data, error };
  };

  const checkAlarmOverlap = async (day_of_week, new_start_time, new_end_time, user_id, exclude_alarm_id = null) => {
    let queryBuilder = supabase.from('alarms').select('id');

    queryBuilder = queryBuilder
      .eq('user_id', user_id)
      .eq('day_of_week', day_of_week)
      // Overlap condition: (existing_start < new_end_time) AND (existing_end > new_start_time)
      .lt('start_time', new_end_time)
      .gt('end_time', new_start_time);

    if (exclude_alarm_id) {
      queryBuilder = queryBuilder.neq('id', exclude_alarm_id);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error('Supabase overlap check error:', error);
      return { hasOverlap: false, error };
    }

    return { hasOverlap: data.length > 0, error: null };
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

        // Explicitly select columns to exclude 'time'
        let queryBuilder = supabase.from('alarms').select('id, label, day_of_week, start_time, end_time, user_id');

        queryBuilder = queryBuilder.eq('user_id', user_id);

        const { data, error } = await queryBuilder.order('start_time', { ascending: true }); // Order by start_time

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
        const { day_of_week, start_time, end_time, label, user_id } = body;

        // Check if required fields are present
        if (!day_of_week || !start_time || !end_time || !label || !user_id) {
          return res.status(400).json({ error: 'Missing required fields: day_of_week, start_time, end_time, label, user_id.' });
        }

        // New validation: start_time cannot be >= end_time
        if (start_time >= end_time) {
          return res.status(400).json({ error: 'End time cannot be before or the same as start time.' });
        }

        // Check if user_id is a valid user_id
        const userExists = await supabaseService.auth.admin.getUserById(user_id);

        if(userExists.error){
          return res.status(500).json({ error: userExists.error.message });
        }

        if (!userExists.data) {
          return res.status(400).json({ error: 'Invalid user ID.' });
        }

        // Check if a user already has an alarm that overlaps with the new one
        const { hasOverlap, error: overlapError } = await checkAlarmOverlap(day_of_week, start_time, end_time, user_id);
        if (overlapError) {
          return res.status(500).json({ error: overlapError.message });
        }
        if (hasOverlap) {
          return res.status(409).json({ error: 'An alarm already overlaps with the specified start and end times for this user on this day.' });
        }

        const { data, error } = await supabase
          .from('alarms')
          .insert([{
            user_id:user_id,
            day_of_week: day_of_week,
            start_time: start_time,
            end_time: end_time,
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
        const { id, start_time, end_time, label } = body;
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

        // Check if any update data is provided for start_time, end_time, or label
        if (!start_time && !end_time && !label) {
          return res.status(400).json({ error: 'No update data provided for start_time, end_time, or label.' });
        }

        const updatePayload = {};
        if (start_time) updatePayload.start_time = start_time;
        if (end_time) updatePayload.end_time = end_time;
        if (label) updatePayload.label = label;

        // New validation: If both start_time and end_time are provided or derived, check their relation
        const newStartTime = updatePayload.start_time || alarmToUpdate.start_time;
        const newEndTime = updatePayload.end_time || alarmToUpdate.end_time;

        if (newStartTime && newEndTime && newStartTime >= newEndTime) {
          return res.status(400).json({ error: 'End time cannot be before or the same as start time.' });
        }

        // Determine if start_time or end_time is being changed
        const isTimeChanging = (start_time && start_time !== alarmToUpdate.start_time) || (end_time && end_time !== alarmToUpdate.end_time);

        // If time is changing, check for conflict with other alarms (excluding itself)
        if (isTimeChanging) {
          const { hasOverlap, error: overlapError } = await checkAlarmOverlap(
            alarmToUpdate.day_of_week,
            newStartTime,
            newEndTime,
            alarmToUpdate.user_id,
            id // Exclude the current alarm being updated
          );

          if (overlapError) {
            return res.status(500).json({ error: overlapError.message });
          }
          if (hasOverlap) {
            return res.status(409).json({ error: 'The updated alarm times overlap with an existing alarm for this user on this day.' });
          }
        }

        const { data, error } = await supabase
          .from('alarms')
          .update(updatePayload)
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
