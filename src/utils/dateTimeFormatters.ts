/**
 * Date and Time Formatting Utilities
 * Standardizes all date/time displays to American formatting conventions
 */

export const formatDate = (date: string | Date): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const year = dateObj.getFullYear();
  
  return `${month}/${day}/${year}`;
};

export const formatTime = (time: string): string => {
  if (!time) return '';
  
  // Handle various time formats: "08:00", "08:00:00", "8:00"
  const timeParts = time.split(':');
  let hours = parseInt(timeParts[0], 10);
  const minutes = timeParts[1] || '00';
  
  if (isNaN(hours)) return time; // Return original if invalid
  
  if (hours === 0) {
    return `12:${minutes} AM`;
  } else if (hours < 12) {
    return `${hours}:${minutes} AM`;
  } else if (hours === 12) {
    return `12:${minutes} PM`;
  } else {
    return `${hours - 12}:${minutes} PM`;
  }
};

export const formatTimeRange = (startTime: string, endTime: string): string => {
  if (!startTime || !endTime) return '';
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

export const formatDateTime = (dateTime: string | Date): string => {
  if (!dateTime) return '';
  
  const dateObj = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  const datePart = formatDate(dateObj);
  const timePart = dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  return `${datePart} at ${timePart}`;
};

export const formatRelativeDate = (date: string | Date): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffTime = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(dateObj);
  }
};

export const formatShortDate = (date: string | Date): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatLongDate = (date: string | Date): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Convert date from MM/DD/YYYY to YYYY-MM-DD for form inputs
export const formatDateForInput = (date: string | Date): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Convert time from 12-hour format to 24-hour for form inputs
export const formatTimeForInput = (time: string): string => {
  if (!time) return '';
  
  // If already in 24-hour format, return as is
  if (!time.includes('AM') && !time.includes('PM')) {
    return time;
  }
  
  const [timePart, meridian] = time.split(' ');
  const [hours, minutes] = timePart.split(':');
  let hour24 = parseInt(hours, 10);
  
  if (meridian === 'AM' && hour24 === 12) {
    hour24 = 0;
  } else if (meridian === 'PM' && hour24 !== 12) {
    hour24 += 12;
  }
  
  return `${String(hour24).padStart(2, '0')}:${minutes}`;
};

// Parse various date formats to consistent Date object
export const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  
  // Try parsing as is first
  let date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  // Try MM/DD/YYYY format
  const mmddyyyy = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mmddyyyy) {
    const [, month, day, year] = mmddyyyy;
    date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  // Try YYYY-MM-DD format
  const yyyymmdd = dateString.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (yyyymmdd) {
    const [, year, month, day] = yyyymmdd;
    date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  return null;
};

// Utility to get current date/time in various formats
export const getCurrentDate = () => formatDate(new Date());
export const getCurrentTime = () => new Date().toLocaleTimeString('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true
});
export const getCurrentDateTime = () => formatDateTime(new Date()); 