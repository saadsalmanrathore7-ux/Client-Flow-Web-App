export function formatTimeAgo(date: Date): string {
  const now = Date.now();
  const value = date instanceof Date ? date.getTime() : new Date(date).getTime();
  const diffMs = now - value;

  if (Number.isNaN(value) || diffMs < 0) {
    return "Just now";
  }

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 30) {
    return "Just now";
  }

  if (seconds < 60) {
    return `${seconds} sec ago`;
  }

  if (minutes < 60) {
    return minutes === 1 ? "1 min ago" : `${minutes} min ago`;
  }

  if (hours < 24) {
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  }

  if (days === 1) {
    return "Yesterday";
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  const weeks = Math.floor(days / 7);

  if (weeks < 4) {
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  }

  const months = Math.floor(days / 30);

  if (months < 12) {
    return months === 1 ? "1 month ago" : `${months} months ago`;
  }

  const years = Math.floor(days / 365);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}

