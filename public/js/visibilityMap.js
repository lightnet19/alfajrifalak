import { getRukyatObservation } from "../core/rukyat.js";

export function generateVisibilityMap({ date, tz = 7, step = 1 }) {
  const points = [];

  for (let lat = -11; lat <= 6; lat += step) {
    for (let lon = 95; lon <= 141; lon += step) {
      const res = getRukyatObservation({
        date,
        lat,
        lon,
        tz,
      });

      points.push({
        lat,
        lon,
        visible: res.mabims.memenuhi,
        yallop: res.yallop.category,
        odeh: res.odeh.category,
        altitude: res.apparentAltitude,
        elongation: res.elongation,
      });
    }
  }

  return points;
}
