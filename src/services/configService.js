import {
  DEFAULT_CHIME_URL,
  DEFAULT_WARNING_CHIME_URL,
  MAX_LABEL_LENGTH,
  MAX_SCHEDULE_NAME_LENGTH
} from '@/config/constants'

export async function getAppConfig(supabase) {
  const { data, error } = await supabase
    .from('app_config')
    .select('key, value')

  const config = {
    default_chime_url: DEFAULT_CHIME_URL,
    default_warning_chime_url: DEFAULT_WARNING_CHIME_URL,
    max_label_length: MAX_LABEL_LENGTH,
    max_schedule_name_length: MAX_SCHEDULE_NAME_LENGTH,
    max_sounds_per_user: 10,
    Account_Creation: false,
    blocked_magic_link_domains: []
  }

  if (error || !data) {
    return config
  }

  data.forEach((row) => {
    const isNumeric = row.key === 'max_sounds_per_user' || row.key === 'max_label_length' || row.key === 'max_schedule_name_length'
    const isBoolean = row.key === 'Account_Creation'
    const isJsonArray = row.key === 'blocked_magic_link_domains'
    
    if (isNumeric) {
      config[row.key] = parseInt(row.value, 10) || config[row.key]
    } else if (isBoolean) {
      config[row.key] = row.value === 'true' || row.value === true
    } else if (isJsonArray) {
      try {
        config[row.key] = JSON.parse(row.value)
      } catch {
        config[row.key] = config[row.key]
      }
    } else {
      config[row.key] = row.value || config[row.key]
    }
  })

  return config
}
