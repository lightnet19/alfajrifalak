import { toJulianDate, getDeltaT, toJulianEphemerisDate } from "./time.js";
import { getSunPosition } from "./sunMeeus.js";
import { getMoonPosition } from "./moonMeeus.js";

function longitudeDiff(date) {
  const JD = toJulianDate(date);
  const deltaT = getDeltaT(date.getFullYear());
  const JDE = toJulianEphemerisDate(JD, deltaT);
  const T = (JDE - 2451545.0) / 36525;
  const sun = getSunPosition(T);
  const moon = getMoonPosition(T);
  let diff = moon.lambda - sun.lambda;
  diff = ((diff + 540) % 360) - 180;
  return diff;
}

export function getIjtima(approxDate) {
  const start = new Date(approxDate);
  start.setHours(0, 0, 0, 0);

  let best = new Date(start);
  let minAbs = Infinity;

  for (let h = 0; h < 24; h += 1) {
    const d = new Date(start);
    d.setHours(h);
    const abs = Math.abs(longitudeDiff(d));
    if (abs < minAbs) {
      minAbs = abs;
      best = d;
    }
  }

  for (let m = -60; m <= 60; m += 1) {
    const d = new Date(best);
    d.setMinutes(d.getMinutes() + m);
    const abs = Math.abs(longitudeDiff(d));
    if (abs < minAbs) {
      minAbs = abs;
      best = d;
    }
  }

  for (let s = -60; s <= 60; s += 1) {
    const d = new Date(best);
    d.setSeconds(d.getSeconds() + s);
    const abs = Math.abs(longitudeDiff(d));
    if (abs < minAbs) {
      minAbs = abs;
      best = d;
    }
  }

  return best;
}
