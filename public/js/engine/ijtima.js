export function estimateIjtima(date) {
  const base = new Date("2026-03-19T01:23:38Z"); // sample epoch

  const diffDays = (date - base) / 86400000;
  const lunation = diffDays / 29.530588;

  const k = Math.round(lunation);

  const ijtima = new Date(base.getTime() + k * 29.530588 * 86400000);

  return ijtima;
}
