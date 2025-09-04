class CommonUtils {
  
  // Will Convert 24 HR time to 12 HR time with AM/PM
  static formatTime(timeString) {
    if (!timeString) return '';
    const [hourString, minute] = timeString.split(':');
    const hour = +hourString % 24;
    const period = hour < 12 ? 'AM' : 'PM';
    const hour12 = hour % 12 || 12;
    const hour12String = hour12 < 10 ? `0${hour12}` : `${hour12}`;

    return `${hour12String}:${minute} ${period}`;
  }

  // Will return current day of the week as string
  static getCurrentDay() {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' });
  }
}

export default CommonUtils;
