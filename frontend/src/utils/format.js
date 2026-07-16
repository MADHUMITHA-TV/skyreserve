export const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

export const formatTime = (isoString) =>
  isoString
    ? new Date(isoString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";

export const formatDate = (isoString) =>
  isoString
    ? new Date(isoString).toLocaleDateString([], {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

export const formatDateTime = (isoString) =>
  isoString ? `${formatDate(isoString)} · ${formatTime(isoString)}` : "-";

export const formatDuration = (departureTime, arrivalTime) => {
  if (!departureTime || !arrivalTime) return "-";

  const minutes = Math.max(
    0,
    Math.round(
      (new Date(arrivalTime).getTime() - new Date(departureTime).getTime()) /
        60000
    )
  );

  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  return `${h}h ${m}m`;
};
