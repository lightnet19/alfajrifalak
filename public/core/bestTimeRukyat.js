import { getHilalMeeus } from "./hilalMeeus.js";

export function getBestTimeRukyat({ date, lat, lon, sunset }) {
  if (sunset == null) return null;

  let bestTime = null;
  let bestScore = -Infinity;

  const startMinutes = Math.floor(sunset * 60);

  for (let minuteOffset = 0; minuteOffset <= 180; minuteOffset += 2) {
    const totalMinutes = startMinutes + minuteOffset;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    const d = new Date(date);
    d.setHours(h, m, 0, 0);

    const data = getHilalMeeus({ date: d, lat, lon });
    const sunAlt = data.sunAltitude;
    const moonAlt = data.apparentAltitude;

    if (sunAlt < -2 && sunAlt > -12 && moonAlt > 0) {
      const score = moonAlt * 2 + (-sunAlt) * 1.5 + data.elongation * 0.2;
      if (score > bestScore) {
        bestScore = score;
        bestTime = new Date(d);
      }
    }
  }

  return bestTime;
}
