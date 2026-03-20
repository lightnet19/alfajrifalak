import { getRukyatObservation } from "../core/rukyat.js";

export function generateMonthlyPrediction({ startDate, lat, lon, tz, days = 30 }) {
  const results = [];

  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);

    const data = getRukyatObservation({
      date: d,
      lat,
      lon,
      tz,
    });

    results.push({
      date: d.toISOString().slice(0, 10),
      sunset: data.sunset == null ? "-" : formatTime(data.sunset),
      bestTime: data.bestTime ? data.bestTime.toLocaleTimeString() : "-",
      altitude: data.apparentAltitude.toFixed(2) + "°",
      elongation: data.elongation.toFixed(2) + "°",
      yallop: data.yallop.category,
      odeh: data.odeh.category,
      mabims: data.mabims.memenuhi ? "Memenuhi" : "Tidak",
      irnu: data.irnu.memenuhi ? "Memenuhi" : "Tidak",
      muhammadiyah: data.muhammadiyah.memenuhi ? "Memenuhi" : "Tidak",
    });
  }

  return results;
}

function formatTime(v) {
  if (v == null) return "-";
  const h = Math.floor(v);
  const m = Math.floor((v - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
