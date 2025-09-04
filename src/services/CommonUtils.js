class CommonUtils {
  static formatTime(timeString) {
    if (!timeString) return '';
    const [hourString, minute] = timeString.split(':');
    const hour = +hourString % 24;
    const period = hour < 12 ? 'AM' : 'PM';
    const hour12 = hour % 12 || 12;
    const hour12String = hour12 < 10 ? `0${hour12}` : `${hour12}`;

    return `${hour12String}:${minute} ${period}`;
  }
}

export default CommonUtils;
