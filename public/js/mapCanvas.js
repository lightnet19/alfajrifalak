export function drawMap(canvas, points, options = {}) {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth || 900;
  const h = canvas.clientHeight || 420;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.clearRect(0, 0, w, h);

  const margin = 16;
  const lonMin = 95, lonMax = 141;
  const latMin = -11, latMax = 6;

  ctx.fillStyle = "#07111f";
  ctx.fillRect(0, 0, w, h);

  // simple country backdrop
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.fillRect(margin, margin, w - margin * 2, h - margin * 2);

  // grid
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const x = margin + ((w - margin * 2) / 5) * i;
    ctx.beginPath();
    ctx.moveTo(x, margin);
    ctx.lineTo(x, h - margin);
    ctx.stroke();
  }
  for (let i = 0; i <= 4; i++) {
    const y = margin + ((h - margin * 2) / 4) * i;
    ctx.beginPath();
    ctx.moveTo(margin, y);
    ctx.lineTo(w - margin, y);
    ctx.stroke();
  }

  // labels
  ctx.fillStyle = "#cbd5e1";
  ctx.font = "12px Inter, system-ui, sans-serif";
  ctx.fillText("95°E", margin, h - 6);
  ctx.fillText("141°E", w - 42, h - 6);
  ctx.fillText("11°S", 8, h - margin);
  ctx.fillText("6°N", 8, margin + 12);

  points.forEach((p) => {
    const x = margin + ((p.lon - lonMin) / (lonMax - lonMin)) * (w - margin * 2);
    const y = margin + ((latMax - p.lat) / (latMax - latMin)) * (h - margin * 2);

    const color = getColor(p);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 4, 4);
  });

  if (options.highlight) {
    const { lat, lon } = options.highlight;
    const x = margin + ((lon - lonMin) / (lonMax - lonMin)) * (w - margin * 2);
    const y = margin + ((latMax - lat) / (latMax - latMin)) * (h - margin * 2);
    ctx.strokeStyle = "#f5c542";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function getColor(p) {
  if (p.visible) return "#34d399";
  if (p.odeh.startsWith("B")) return "#a3e635";
  if (p.odeh.startsWith("C")) return "#fde047";
  if (p.odeh.startsWith("D")) return "#fb923c";
  return "#fb7185";
}
