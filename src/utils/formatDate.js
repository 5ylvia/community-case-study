export function formatDate(iso) {
  const d = new Date(iso);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()];
  let h = d.getHours();
  const min = String(d.getMinutes()).padStart(2, "0");
  const ampm = h < 12 ? "am" : "pm";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${weekday}, ${month} ${day} ${h}:${min}${ampm}`;
}
