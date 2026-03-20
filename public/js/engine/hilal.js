import { toJulianDate, getDeltaT } from "./time.js";
import { getSun } from "./sun.js";
import { getMoon } from "./moon.js";

export function calculateHilal(date) {
  const JD = toJulianDate(date);
  const deltaT = getDeltaT(date.getFullYear());

  const JDE = JD + deltaT / 86400;
  const T = (JDE - 2451545) / 36525;

  const sun = getSun(T);
  const moon = getMoon(T);

  const elongation = Math.abs(moon.lambda - sun.lambda);

  const illumination =
    (1 - Math.cos(elongation * Math.PI / 180)) / 2;

  return {
    JD,
    deltaT,
    elongation,
    illumination,
    distance: moon.distance,
  };
}
