export function isNewMonth({ ijtima, sunset, visible }) {
  if (!ijtima || sunset == null) return false;
  const ijtimaHour = ijtima.getHours() + ijtima.getMinutes() / 60 + ijtima.getSeconds() / 3600;
  return ijtimaHour < sunset && visible;
}
