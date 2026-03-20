export function drawSky(canvas, data) {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const horizonY = h * 0.72;
  ctx.clearRect(0, 0, w, h);

  const sky = ctx.createLinearGradient(0, 0, 0, h);
  const sunAlt = data.sunAlt ?? -10;

  if (sunAlt > 10) {
    sky.addColorStop(0, "#08111f");
    sky.addColorStop(1, "#1d3557");
  } else if (sunAlt > -4) {
    sky.addColorStop(0, "#07111f");
    sky.addColorStop(0.52, "#ff9c66");
    sky.addColorStop(1, "#1a2237");
  } else {
    sky.addColorStop(0, "#020712");
    sky.addColorStop(1, "#0a1020");
  }

  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(w * 0.5, horizonY, 20, w * 0.5, horizonY, w * 0.45);
  glow.addColorStop(0, "rgba(255,180,80,0.18)");
  glow.addColorStop(1, "rgba(255,180,80,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#0a0f18";
  ctx.fillRect(0, horizonY, w, h - horizonY);

  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.beginPath();
  ctx.moveTo(0, horizonY);
  ctx.lineTo(w, horizonY);
  ctx.stroke();

  ctx.font = "12px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ["N", "E", "S", "W"].forEach((d, i) => ctx.fillText(d, (i / 4) * w + 10, horizonY + 18));

  drawStars(ctx, w, horizonY, sunAlt);

  const project = (alt, az) => {
    const x = (az / 360) * w;
    const y = horizonY - (alt / 90) * horizonY;
    return { x, y };
  };

  const sun = project(data.sunAlt ?? -10, data.sunAz ?? 0);
  const moon = project(data.moonAlt ?? 0, data.moonAz ?? 0);

  if (data.sunAlt > -18) {
    const sunGlow = ctx.createRadialGradient(sun.x, sun.y, 0, sun.x, sun.y, 58);
    sunGlow.addColorStop(0, "rgba(255,220,140,0.85)");
    sunGlow.addColorStop(0.35, "rgba(255,180,80,0.35)");
    sunGlow.addColorStop(1, "rgba(255,180,80,0)");
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sun.x, sun.y, 58, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffcc66";
    ctx.beginPath();
    ctx.arc(sun.x, sun.y, 12, 0, Math.PI * 2);
    ctx.fill();
  }

  drawCrescentMoon(ctx, moon.x, moon.y, 14, data);

  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.fillText("Sun", sun.x + 15, sun.y - 10);
  ctx.fillText("Moon", moon.x + 15, moon.y - 10);

  if (data.rukyat) {
    ctx.strokeStyle = "#66ff88";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(moon.x, moon.y, 24, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawStars(ctx, w, horizonY, sunAlt) {
  const count = sunAlt < -6 ? 80 : sunAlt < 0 ? 35 : 10;
  for (let i = 0; i < count; i++) {
    const x = random(1337 + i * 17) * w;
    const y = random(1337 + i * 31) * (horizonY - 20);
    const r = random(1337 + i * 43) * 1.6 + 0.4;
    const a = Math.min(1, 0.2 + random(1337 + i * 59) * 0.8);
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCrescentMoon(ctx, x, y, r, data) {
  const phase = Math.max(0.04, Math.min(0.35, (data.raw?.yallop?.W ?? 0.02) * 10));
  const angle = (((data.sunAz ?? 0) - (data.moonAz ?? 0)) * Math.PI) / 180;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  ctx.fillStyle = "#e6e6e6";
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(r * (1 - phase * 6), 0, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function random(n) {
  const x = Math.sin(n) * 10000;
  return x - Math.floor(x);
}
