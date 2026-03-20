export function drawSky(canvas, data) {
  const ctx = canvas.getContext("2d");

  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  canvas.width = w;
  canvas.height = h;

  ctx.clearRect(0, 0, w, h);

  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, w, h);

  const horizonY = h * 0.75;
  ctx.strokeStyle = "#64748b";
  ctx.beginPath();
  ctx.moveTo(0, horizonY);
  ctx.lineTo(w, horizonY);
  ctx.stroke();

  function toXY(alt, az) {
    const x = (az / 360) * w;
    const y = horizonY - (alt / 90) * (horizonY - 20);
    return { x, y };
  }

  const sun = toXY(data.sunAlt, data.sunAz);
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.arc(sun.x, sun.y, 10, 0, Math.PI * 2);
  ctx.fill();

  const moon = toXY(data.moonAlt, data.moonAz);
  ctx.fillStyle = "#e5e7eb";
  ctx.beginPath();
  ctx.arc(moon.x, moon.y, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#94a3b8";
  ctx.font = "12px sans-serif";
  ctx.fillText("Sun", sun.x + 10, sun.y);
  ctx.fillText("Moon", moon.x + 10, moon.y);

  if (data.rukyat) {
    ctx.strokeStyle = "#22c55e";
    ctx.beginPath();
    ctx.arc(moon.x, moon.y, 16, 0, Math.PI * 2);
    ctx.stroke();
  }
}
