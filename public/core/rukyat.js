import { getSunset } from "./solarTime.js";
import { getHilalMeeus } from "./hilalMeeus.js";
import { getYallopAccurate } from "./yallopAccurate.js";
import { getOdehVisibility } from "./odeh.js";
import { getIjtima } from "./ijtima.js";
import { isNewMonth } from "./hijriDecision.js";

export function getRukyatObservation({ date, lat, lon, tz }) {
  const sunset = getSunset({ date, lat, lon, tz });
  let sunsetDate = null;
  if (sunset != null) {
    sunsetDate = new Date(date);
    sunsetDate.setHours(Math.floor(sunset));
    sunsetDate.setMinutes(Math.floor((sunset % 1) * 60));
    sunsetDate.setSeconds(0, 0);
  }

  const observationTime = sunsetDate ?? new Date(date);
  const hilal = getHilalMeeus({ date: observationTime, lat, lon });
  const ijtima = getIjtima(date);
  const yallop = getYallopAccurate({ moonAlt: hilal.apparentAltitude, sunAlt: hilal.sunAltitude, elongation: hilal.elongation, semiDiameter: hilal.semiDiameter });
  const odeh = getOdehVisibility({ moonAlt: hilal.apparentAltitude, sunAlt: hilal.sunAltitude, elongation: hilal.elongation, semiDiameter: hilal.semiDiameter });
  const decision = isNewMonth({ ijtima, sunset, visible: hilal.visible });
  const moonLag = sunsetDate ? (hilal.moonAltitude > 0 ? 0.5 : 0) : null;

  return { sunset, observationTime, ijtima, moonLag, ...hilal, yallop, odeh, decision };
}
