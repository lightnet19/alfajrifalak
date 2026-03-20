export function buildShareText(data) {
  const r = data.raw;

  return `
🌙 HASIL RUKYAT HILAL — ALFAJRI

📍 Markaz      : ${data.markaz || "-"}
📌 Koordinat   : ${data.lat}, ${data.lon}
🗻 Elevasi     : ${data.elevation || 0} mdpl
⏱️ Tanggal     : ${data.date}

🌇 Sunset      : ${formatTime(r.sunset)}
🌙 Ijtima      : ${r.ijtima ? r.ijtima.toLocaleString() : "-"}
🕒 Umur Hilal  : ${formatNum(r.moonAgeHours)} jam
⏳ Moon Lag    : ${formatNum(r.moonLagMinutes)} menit
📈 Altitude    : ${formatNum(r.apparentAltitude)}°
📐 Elongasi    : ${formatNum(r.elongation)}°

🌍 INTERNASIONAL
Yallop        : ${r.yallop.category}
Odeh          : ${r.odeh.category}

🇮🇩 INDONESIA
MABIMS        : ${r.mabims.memenuhi ? "✅ Memenuhi" : "❌ Tidak"}
IRNU (NU)     : ${r.irnu.memenuhi ? "✅ Memenuhi" : "❌ Tidak"}
Muhammadiyah  : ${r.muhammadiyah.memenuhi ? "✅ Memenuhi" : "❌ Tidak"}

📊 Kesimpulan:
${r.decision ? "Hilal Layak (berdasarkan MABIMS)" : "Belum Layak / Istikmal"}

#Alfajri #Rukyat #Falak
`.trim();
}

function formatTime(v) {
  if (v == null) return "-";
  const h = Math.floor(v);
  const m = Math.floor((v - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function formatNum(v) {
  return Number.isFinite(v) ? v.toFixed(2) : "-";
}
