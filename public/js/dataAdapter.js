import { getRukyatObservation } from "../core/rukyat.js";

export function getSkyData({ lat, lon, tz, date, elevation = 0, markaz = "" }) {
  const result = getRukyatObservation({ lat, lon, tz, date, elevation, markaz });
  return {
    sunAlt: result.sunAltitude,
    sunAz: result.sunAzimuth,
    moonAlt: result.apparentAltitude,
    moonAz: result.moonAzimuth,
    raw: result,
    rukyat: false,
  };
}
