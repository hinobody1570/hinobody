// Helper function to format timestamp (relative time, e.g. "5 mins ago")
// Pass t from useTranslations("timeAgo") to get localized strings in all languages
export type TimeAgoTranslator = (key: string, values?: Record<string, number | string>) => string;

export const formatTimestamp = (
  dateString: string,
  t: TimeAgoTranslator | any
): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    const count = diffInSeconds;
    return t(count === 1 ? "secAgo" : "secsAgo", { count });
  }
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return t(minutes === 1 ? "minAgo" : "minsAgo", { count: minutes });
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return t(hours === 1 ? "hrAgo" : "hrsAgo", { count: hours });
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return t(days === 1 ? "dayAgo" : "daysAgo", { count: days });
  }
  const weeks = Math.floor(diffInSeconds / 604800);
  return t(weeks === 1 ? "weekAgo" : "weeksAgo", { count: weeks });
};
