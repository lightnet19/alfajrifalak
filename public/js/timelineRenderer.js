export function renderTimeline(container, data) {
  container.innerHTML = "";

  data.forEach((d) => {
    const item = document.createElement("div");
    item.className = "card";
    item.style.marginBottom = "12px";
    item.innerHTML = `
      <h3 style="margin-top:0">${d.date}</h3>
      <div class="grid-2">
        <div class="metric"><span>Sunset</span><strong>${d.sunset || "-"}</strong></div>
        <div class="metric"><span>Best Time</span><strong>${d.bestTime || "-"}</strong></div>
        <div class="metric"><span>Altitude</span><strong>${d.altitude}</strong></div>
        <div class="metric"><span>Elongasi</span><strong>${d.elongation}</strong></div>
        <div class="metric"><span>Yallop</span><strong>${d.yallop}</strong></div>
        <div class="metric"><span>Odeh</span><strong>${d.odeh}</strong></div>
      </div>
      <p style="margin-top:12px" class="small">MABIMS: <b>${d.mabims}</b> | IRNU: <b>${d.irnu}</b> | Muhammadiyah: <b>${d.muhammadiyah}</b></p>
    `;
    container.appendChild(item);
  });
}
