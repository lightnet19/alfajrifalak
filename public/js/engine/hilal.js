import { toJulianDate, getDeltaT } from "./time.js";
import { getSun } from "./sun.js";
import { getMoon } from "./moon.js";
import { getSiderealTime, equatorialToHorizontal } from "./coordinate.js";
import { getSunset } from "./sunset.js";

export function calculateHilal(date, lat, lon, tz) {
  const JD = toJulianDate(date);
  const deltaT = getDeltaT(date.getFullYear());

  const JDE = JD + deltaT / 86400;
  const T = (JDE - 2451545) / 36525;

  const sun = getSun(T);
  const moon = getMoon(T);

  const LST = getSiderealTime(JD, lon);

  const sunHor = equatorialToHorizontal(
    sun.RA,
    sun.Dec,
    lat,
    LST
  );

  const moonHor = equatorialToHorizontal(
    moon.RA,
    moon.Dec,
    lat,
    LST
  );

  const elongation = Math.abs(moon.lambda - sun.lambda);

  const sunset = getSunset(date, lat, lon, tz);

  return {
    JD,
    deltaT,
    sunset,
    sunAltitude: sunHor.alt,
    moonAltitude: moonHor.alt,
    sunAzimuth: sunHor.az,
    moonAzimuth: moonHor.az,
    elongation,
  };
}
