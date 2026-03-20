import { toJulianDate, getDeltaT, toJulianEphemerisDate } from "./time.js";
import { getSunPosition } from "./sunMeeus.js";
import { getMoonPosition } from "./moonMeeus.js";
import { getSiderealTime, equatorialToHorizontal } from "./coordinate.js";
import { applyParallax } from "./parallax.js";
import { getRefraction, getMoonSemiDiameter } from "./refraction.js";
import { getTopocentricEcliptic } from "./topocentricEcliptic.js";
import { getTrueObliquity } from "./ecliptic.js";
import { getAberration } from "./aberration.js";
import { getNutation } from "./nutation.js";

export function getHilalMeeus({ date, lat, lon, elevation = 0 }) {
  const JD = toJulianDate(date);
  const deltaT = getDeltaT(date.getFullYear());
  const JDE = toJulianEphemerisDate(JD, deltaT);
  const T = (JDE - 2451545.0) / 36525;

  const sun = getSunPosition(T);
  const moon = getMoonPosition(T);
  const LST = getSiderealTime(JD, lon);

  const moonTopoEq = applyParallax({
    RA: moon.RA,
    Dec: moon.Dec,
    lat,
    LST,
    distanceKm: moon.distanceKm,
  });

  const sunHor = equatorialToHorizontal(sun.RA, sun.Dec, lat, LST);
  const moonHor = equatorialToHorizontal(moonTopoEq.RA, moonTopoEq.Dec, lat, LST);

  const elongation = getElongation(sun, moon);
  const { deltaPsi } = getNutation(T);
  const epsilon = getTrueObliquity(T);

  const lambdaSunApp = sun.lambda + deltaPsi + getAberration(sun.lambda, T);
  const lambdaMoonApp = moon.lambda + deltaPsi;

  const topoEcl = getTopocentricEcliptic({
    lambda: moon.lambda,
    beta: moon.beta,
    distanceKm: moon.distanceKm,
    lat,
    LST,
    RA: moon.RA,
    Dec: moon.Dec,
  });

  const refraction = getRefraction(moonHor.alt);
  const semiDiameter = getMoonSemiDiameter(moon.distanceKm);
  const apparentAltitude = moonHor.alt + refraction + semiDiameter;

  return {
    JD,
    deltaT,
    JDE,
    epsilon,
    sunLongitudeApp: lambdaSunApp,
    moonLongitudeApp: lambdaMoonApp,
    topocentricEcliptic: topoEcl,
    sunAltitude: sunHor.alt,
    sunAzimuth: sunHor.az,
    moonAltitude: moonHor.alt,
    moonAzimuth: moonHor.az,
    apparentAltitude,
    refraction,
    semiDiameter,
    elongation,
    moonDistanceKm: moon.distanceKm,
    visible: apparentAltitude > 3 && elongation > 6.4,
  };
}

function getElongation(sun, moon) {
  const rad = Math.PI / 180;
  return Math.acos(
    Math.sin(sun.Dec * rad) * Math.sin(moon.Dec * rad) +
      Math.cos(sun.Dec * rad) * Math.cos(moon.Dec * rad) * Math.cos((sun.RA - moon.RA) * rad)
  ) / rad;
}
