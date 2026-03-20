import { getSunset } from "./solarTime.js";
import { getHilalMeeus } from "./hilalMeeus.js";
import { getYallopAccurate } from "./yallopAccurate.js";
import { getOdehVisibility } from "./odeh.js";
import { getIjtima } from "./ijtima.js";
import { isNewMonth } from "./hijriDecision.js";
import { getMabimsCriteria } from "./mabims.js";
import { getIRNUCriteria } from "./irnu.js";
import { getMuhammadiyahCriteria } from "./muhammadiyah.js";
import { getBestTimeRukyat } from "./bestTimeRukyat.js";
import { dateFromDecimalHours } from "./time.js";

function findMoonset({ date, lat, lon, sunsetHour }) {
  if (sunsetHour == null) return null;

  const startMinutes = Math.floor(sunsetHour * 60);
  let prevAlt = null;

  for (let minuteOffset = 0; minuteOffset <= 420; minuteOffset += 5) {
    const totalMinutes = startMinutes + minuteOffset;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    const d = new Date(date);
    d.setHours(h, m, 0, 0);

    const data = getHilalMeeus({ date: d, lat, lon });
    const alt = data.moonAltitude;

    if (prevAlt !== null && prevAlt > 0 && alt <= 0) {
      const prevTime = new Date(d);
      prevTime.setMinutes(prevTime.getMinutes() - 5);
      const frac = prevAlt / (prevAlt - alt);
      return new Date(prevTime.getTime() + frac * 5 * 60 * 1000);
    }

    prevAlt = alt;
  }

  return null;
}

export function getRukyatObservation({ date, lat, lon, tz, elevation = 0, markaz = "" }) {
  const sunset = getSunset({ date, lat, lon, tz });

  const sunsetDate = sunset == null ? new Date(date) : dateFromDecimalHours(date, sunset);
  const hilalAtSunset = getHilalMeeus({ date: sunsetDate, lat, lon, elevation });

  const ijtima = getIjtima(date);

  const yallop = getYallopAccurate({
    moonAlt: hilalAtSunset.apparentAltitude,
    sunAlt: hilalAtSunset.sunAltitude,
    elongation: hilalAtSunset.elongation,
    semiDiameter: hilalAtSunset.semiDiameter,
  });

  const odeh = getOdehVisibility({
    moonAlt: hilalAtSunset.apparentAltitude,
    sunAlt: hilalAtSunset.sunAltitude,
    elongation: hilalAtSunset.elongation,
    semiDiameter: hilalAtSunset.semiDiameter,
  });

  const mabims = getMabimsCriteria({
    altitude: hilalAtSunset.apparentAltitude,
    elongation: hilalAtSunset.elongation,
  });

  const irnu = getIRNUCriteria({
    altitude: hilalAtSunset.apparentAltitude,
    elongation: hilalAtSunset.elongation,
  });

  const muhammadiyah = getMuhammadiyahCriteria({
    altitude: hilalAtSunset.apparentAltitude,
    ijtima,
    sunset,
  });

  const moonset = findMoonset({ date, lat, lon, sunsetHour: sunset });
  const moonLagMinutes =
    sunsetDate && moonset ? (moonset.getTime() - sunsetDate.getTime()) / 60000 : null;

  const bestTime = getBestTimeRukyat({
    date,
    lat,
    lon,
    sunset,
  });

  const moonAgeHours = ijtima ? (sunsetDate.getTime() - ijtima.getTime()) / 3600000 : null;

  const decision = mabims.memenuhi;

  return {
    markaz,
    lat,
    lon,
    tz,
    elevation,
    JD: hilalAtSunset.JD,
    deltaT: hilalAtSunset.deltaT,
    JDE: hilalAtSunset.JDE,
    epsilon: hilalAtSunset.epsilon,
    ijtima,
    sunset,
    sunsetDate,
    moonset,
    moonLagMinutes,
    bestTime,
    moonAgeHours,
    ...hilalAtSunset,
    yallop,
    odeh,
    mabims,
    irnu,
    muhammadiyah,
    decision,
    visible: hilalAtSunset.visible,
  };
}
