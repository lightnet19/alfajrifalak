export function getMoonAge(date, ijtima) {
  const diff = (date - ijtima) / 3600000;
  return diff; // jam
}
