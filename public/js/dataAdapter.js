import { getRukyatObservation } from "../core/rukyat.js";

export function getSkyData({ lat, lon, tz, date }) {
  const result = getRukyatObservation({ lat, lon, tz, date });
  return {
    sunAlt: result.sunAltitude,
    sunAz: result.sunAzimuth,
    moonAlt: result.apparentAltitude,
    moonAz: result.moonAzimuth,
    raw: result,
  };
}
