import { toJulianDate, getDeltaT } from "./time.js";
import { getSun } from "./sun.js";
import { getMoon } from "./moon.js";
import { getSiderealTime, equatorialToHorizontal } from "./coordinate.js";
import { getSunset } from "./sunset.js";
import { getRefraction } from "./refraction.js";
import { applyParallax } from "./parallax.js";
import { getYallop, getOdeh } from "./visibility.js";

// ========================
// IJTIMA (APPROX)
// ========================
function estimateIjtima(date) {
  const base = new Date("2026-03-19T01:23:38Z");
  const diffDays = (date - base) / 86400000;
  const lunation = diffDays / 29.530588;
  const k = Math.round(lunation);
  return new Date(base.getTime() + k * 29.530588 * 86400000);
}

// ========================
// MOON AGE
// ========================
function getMoonAge(date, ijtima) {
  return (date - ijtima) / 3600000; // jam
}

// ========================
// MAIN ENGINE
// ========================
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

  // ========================
  // ELONGASI
  // ========================
  let elongation = Math.abs(moon.lambda - sun.lambda);
  if (elongation > 180) elongation = 360 - elongation;

  // ========================
  // REFRACTION
  // ========================
  const refraction = getRefraction(moonHor.alt);

  // ========================
  // PARALLAX
  // ========================
  const parallaxAlt = applyParallax(
    moonHor.alt,
    moon.distance || 384400
  );

  // ========================
  // SEMI DIAMETER
  // ========================
  const semiDiameter = 0.2725;

  // ========================
  // ALTITUDES
  // ========================
  const apparentAltitude = moonHor.alt + refraction;
  const observedAltitude = apparentAltitude + semiDiameter;

  // ========================
  // SUNSET
  // ========================
  const sunset = getSunset(date, lat, lon, tz);

  // ========================
  // MOON LAG
  // ========================
  const moonLag = observedAltitude > 0
    ? observedAltitude * 4
    : 0;

  // ========================
  // VISIBILITY
  // ========================
  const yallop = getYallop(observedAltitude, elongation);
  const odeh = getOdeh(observedAltitude, elongation);

  const visible =
    observedAltitude > 3 &&
    elongation > 6.4;

  // ========================
  // IJTIMA & AGE
  // ========================
  const ijtima = estimateIjtima(date);
  const moonAge = getMoonAge(date, ijtima);

  // ========================
  // BEST TIME
  // ========================
  const bestTime =
    sunset + (moonLag / 60) / 2;

  return {
    // ========================
    // CORE
    // ========================
    JD,
    deltaT,

    // ========================
    // SUN
    // ========================
    sunAltitude: sunHor.alt,
    sunAzimuth: sunHor.az,

    // ========================
    // MOON
    // ========================
    moonAltitude: moonHor.alt,
    apparentAltitude,
    observedAltitude,
    moonAzimuth: moonHor.az,

    // ========================
    // GEOMETRY
    // ========================
    elongation,

    // ========================
    // CORRECTIONS
    // ========================
    refraction,
    parallaxAlt,
    semiDiameter,

    // ========================
    // TIME
    // ========================
    sunset,
    moonLag,
    bestTime,

    // ========================
    // VISIBILITY
    // ========================
    yallop,
    odeh,
    visible,

    // ========================
    // PHASE
    // ========================
    ijtima,
    moonAge
  };
}
