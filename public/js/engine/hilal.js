import { toJulianDate, getDeltaT } from "./time.js";
import { getSun } from "./sun.js";
import { getMoon } from "./moon.js";
import { getSiderealTime, equatorialToHorizontal } from "./coordinate.js";
import { getSunset } from "./sunset.js";
import { getRefraction } from "./refraction.js";
import { applyParallax } from "./parallax.js";
import { getYallop, getOdeh } from "./visibility.js";

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

  // ========================
  // 🔭 KOREKSI OBSERVATORIUM
  // ========================

  const refraction = getRefraction(moonHor.alt);

  const parallaxAlt = applyParallax(
    moonHor.alt,
    moon.distance || 384400
  );

  const semiDiameter = 0.2725; // derajat

  const apparentAlt = moonHor.alt + refraction;
  const observedAlt = apparentAlt + semiDiameter;

  // ========================
  // ⏳ SUNSET & MOON LAG
  // ========================

  const sunset = getSunset(date, lat, lon, tz);

  const moonLag = observedAlt > 0 ? observedAlt * 4 : 0;

  // ========================
  // 🌙 VISIBILITY
  // ========================

  const yallop = getYallop(observedAlt, elongation);
  const odeh = getOdeh(observedAlt, elongation);

  const visible = observedAlt > 3 && elongation > 6.4;

  return {
    JD,
    deltaT,
    sunset,

    sunAltitude: sunHor.alt,
    sunAzimuth: sunHor.az,

    moonAltitude: moonHor.alt,
    apparentAltitude: apparentAlt,
    observedAltitude: observedAlt,
    moonAzimuth: moonHor.az,

    elongation,
    refraction,
    parallaxAlt,
    semiDiameter,

    moonLag,

    yallop,
    odeh,
    visible
  };
}
