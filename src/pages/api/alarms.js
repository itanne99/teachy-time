import createClient from '@/supabase/api'
import { DAYS_OF_WEEK } from '@/config/constants'
import { getAppConfig } from '@/services/configService'

async function getAuthUserId(req, res) {
  const supabase = createClient(req, res)
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return { userId: null, error: 'Unauthorized' }
  }
  return { userId: user.id, error: null }
}

export default async function handler(req, res) {
  const { method, body } = req

  const supabase = createClient(req, res);

  const { userId, error: authError } = await getAuthUserId(req, res);
  if (authError) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // Helper function to check for existing alarms
  const checkExistingAlarm = async (alarmIdentifier, user_id, schedule_id) => {
    let queryBuilder = supabase.from('alarms').select('*');

    if (alarmIdentifier.id) {
      queryBuilder = queryBuilder.eq('id', alarmIdentifier.id);
    } else if (alarmIdentifier.day_of_week && alarmIdentifier.start_time && alarmIdentifier.end_time && schedule_id) { // Updated condition to use start_time and end_time
      queryBuilder = queryBuilder
        .eq('day_of_week', alarmIdentifier.day_of_week)
        .eq('start_time', alarmIdentifier.start_time) // Use start_time
        .eq('end_time', alarmIdentifier.end_time)   // Use end_time
        .eq('user_id', user_id)
        .eq('schedule_id', schedule_id);
    } else {
      return { data: null, error: { message: 'Invalid timer identifier provided.' } };
    }
    const { data, error } = await queryBuilder.single();
    return { data, error };
  };

  const checkAlarmOverlap = async (day_of_week, new_start_time, new_end_time, user_id, schedule_id, exclude_alarm_id = null) => {
    let queryBuilder = supabase.from('alarms').select('id');

    queryBuilder = queryBuilder
      .eq('user_id', user_id)
      .eq('schedule_id', schedule_id)
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
    case 'POST':
      try {
        const { schedule_id } = body;

        if (!schedule_id) {
          res.status(400).json({ error: 'Schedule ID is required.' });
          return;
        }

        let queryBuilder = supabase.from('alarms').select('id, label, day_of_week, start_time, end_time, user_id, schedule_id, play_sound, sound_id, play_warning_sound, warning_sound_id, alarm_sounds!left(storage_url)');

        queryBuilder = queryBuilder.eq('user_id', userId).eq('schedule_id', schedule_id);

        const { data, error } = await queryBuilder.order('start_time', { ascending: true }); // Order by start_time

        if (data) {
          const transformedData = {}
          DAYS_OF_WEEK.forEach(day => {
            transformedData[day] = []
          })

          data.forEach(alarm => {
            const dayName = DAYS_OF_WEEK[alarm.day_of_week]
            if (dayName) {
              transformedData[dayName].push({
                ...alarm,
                sound_url: alarm.alarm_sounds?.storage_url || null,
                warning_sound_url: null,
                alarm_sounds: undefined,
              })
            }
          })
          res.status(200).json(transformedData);
          return;
        }

        if (error) {
          console.error('Supabase error:', error);
          res.status(500).json({ error: error.message });
          return;
        }

        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({ error: 'An unexpected error occurred.', details: error.message });
      }
      break;

    case 'PUT':
      try {
        const { day_of_week, start_time, end_time, label, schedule_id, play_sound, sound_id, play_warning_sound, warning_sound_id } = body

        if ((!day_of_week && day_of_week !== 0) || !start_time || !end_time || !label || !schedule_id) {
          res.status(400).json({ error: 'Missing required fields: day_of_week, start_time, end_time, label, schedule_id.' })
          return
        }

        const config = await getAppConfig(supabase)
        if (label.length > config.max_label_length) {
          res.status(400).json({ error: `Label cannot exceed ${config.max_label_length} characters.` })
          return
        }

        if (start_time >= end_time) {
          res.status(400).json({ error: 'End time cannot be before or the same as start time.' });
          return;
        }

        const { hasOverlap, error: overlapError } = await checkAlarmOverlap(day_of_week, start_time, end_time, userId, schedule_id);
        if (overlapError) {
          res.status(500).json({ error: overlapError.message });
          return;
        }
        if (hasOverlap) {
          res.status(409).json({ error: 'A timer already overlaps with the specified start and end times for this user on this day.' });
          return;
        }

        const { data, error } = await supabase
          .from('alarms')
          .insert([{
            user_id: userId,
            schedule_id: schedule_id,
            day_of_week: day_of_week,
            start_time: start_time,
            end_time: end_time,
            label: label,
            play_sound: play_sound || false,
            sound_id: sound_id || null,
            play_warning_sound: play_warning_sound || false,
            warning_sound_id: warning_sound_id || null }])
          .select()
          .single();

        if (error) {
          console.error('Supabase error:', error);
          res.status(500).json({ error: error.message });
          return;
        }

        res.status(201).json(data);
      } catch (error) {
        res.status(500).json({ error: 'An unexpected error occurred.', details: error.message });
      }
      break;

    case 'PATCH':
      try {
        const { id, start_time, end_time, label, play_sound, sound_id, play_warning_sound, warning_sound_id } = body
        if (!id) {
          res.status(400).json({ error: 'Timer ID is required.' })
          return
        }

        if (label) {
          const config = await getAppConfig(supabase)
          if (label.length > config.max_label_length) {
            res.status(400).json({ error: `Label cannot exceed ${config.max_label_length} characters.` })
            return
          }
        }

        const { data: alarmToUpdate, error: alarmToUpdateError } = await checkExistingAlarm({ id });

        if (alarmToUpdateError) {
          if (alarmToUpdateError.code === 'PGRST116') {
            res.status(404).json({ error: 'Timer not found.' });
            return;
          }
          console.error('Supabase error:', alarmToUpdateError);
          res.status(500).json({ error: alarmToUpdateError.message });
          return;
        }

        if (alarmToUpdate.user_id !== userId) {
          res.status(403).json({ error: 'Forbidden: You do not own this timer.' });
          return;
        }
        if (!start_time && !end_time && !label && play_sound === undefined && sound_id === undefined && play_warning_sound === undefined && warning_sound_id === undefined) {
          res.status(400).json({ error: 'No update data provided for start_time, end_time, label, play_sound, sound_id, play_warning_sound, or warning_sound_id.' });
          return;
        }

        const updatePayload = {};
        if (start_time) updatePayload.start_time = start_time;
        if (end_time) updatePayload.end_time = end_time;
        if (label) updatePayload.label = label;
        if (play_sound !== undefined) updatePayload.play_sound = play_sound;
        if (sound_id !== undefined) updatePayload.sound_id = sound_id;
        if (play_warning_sound !== undefined) updatePayload.play_warning_sound = play_warning_sound;
        if (warning_sound_id !== undefined) updatePayload.warning_sound_id = warning_sound_id;

        // New validation: If both start_time and end_time are provided or derived, check their relation
        const newStartTime = updatePayload.start_time || alarmToUpdate.start_time;
        const newEndTime = updatePayload.end_time || alarmToUpdate.end_time;

        if (newStartTime && newEndTime && newStartTime >= newEndTime) {
          res.status(400).json({ error: 'End time cannot be before or the same as start time.' });
          return;
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
            alarmToUpdate.schedule_id,
            id // Exclude the current alarm being updated
          );

          if (overlapError) {
            res.status(500).json({ error: overlapError.message });
            return;
          }
          if (hasOverlap) {
            res.status(409).json({ error: 'The updated timer times overlap with an existing timer for this user on this day.' });
            return;
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
          res.status(500).json({ error: error.message });
          return;
        }

        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({ error: 'An unexpected error occurred.', details: error.message });
      }
      break;

    case 'DELETE':
      try {
        const { id, day_of_week } = body;
        
        if (id) {
          const { data: alarmToDelete, error: alarmToDeleteError } = await checkExistingAlarm({ id });

          if (alarmToDeleteError) {
            if (alarmToDeleteError.code === 'PGRST116') {
              res.status(404).json({ error: 'Timer not found.' });
              return;
            }
            console.error('Supabase error:', alarmToDeleteError);
            res.status(500).json({ error: alarmToDeleteError.message });
            return;
          }

          if (alarmToDelete.user_id !== userId) {
            res.status(403).json({ error: 'Forbidden: You do not own this timer.' });
            return;
          }

          const { error } = await supabase
            .from('alarms')
            .delete()
            .eq('id', id);

          if (error) {
            res.status(500).json({ error: error.message });
            return;
          }

          res.status(200).end();
          return;
        } 
        
        if (day_of_week !== undefined) {
          const { schedule_id } = body;
          const { error } = await supabase
            .from('alarms')
            .delete()
            .eq('user_id', userId)
            .eq('day_of_week', day_of_week)
            .eq('schedule_id', schedule_id);

          if (error) {
            res.status(500).json({ error: error.message });
            return;
          }

          res.status(200).end();
          return;
        }

        res.status(400).json({ error: 'Timer ID or Day of Week is required.' });
      } catch (error) {
        res.status(500).json({ error: 'An unexpected error occurred.', details: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['POST', 'PUT', 'PATCH', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
