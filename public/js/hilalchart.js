/**
 * hilalchart.js — Grafik Visibilitas Hilal & Sinkronisasi Kalender
 * Al-Fajri v2.7.0 | Lembaga Falakiyah PCNU Kencong
 * Depends on: math.js, astro.js, hilal.js
 * External: Chart.js v4
 */
'use strict';

/**
 * Render chart dan tabel hilal untuk 1 tahun Hijriyah
 */
let hilalChartInstance = null;

function doGenerateHilalChart() {
  const yearInput = document.getElementById('hcYear').value;
  const hYear = parseInt(yearInput, 10);
  if (!hYear || isNaN(hYear)) {
    alert('Masukkan tahun Hijriyah yang valid.');
    return;
  }

  // 1. Kumpulkan data 12 bulan
  const dataList = [];
  const LAT = parseFloat(document.getElementById('inpLat').value);
  const LNG = parseFloat(document.getElementById('inpLng').value);
  const ELEV = parseFloat(document.getElementById('inpElev').value);
  const TZ = parseFloat(document.getElementById('inpTZ').value);

  document.getElementById('hcLoading').style.display = 'block';
  document.getElementById('hcContainer').style.display = 'none';

  // Biarkan browser render loading state, eksekusi berat via setTimeout
  setTimeout(() => {
    for (let m = 1; m <= 12; m++) {
      const result = calcHilal(hYear, m, LAT, LNG, ELEV, TZ);
      if (!result.error) {
        dataList.push(result);
      }
    }

    _renderHilalChart(dataList, hYear);
    _renderSyncTable(dataList, hYear);

    document.getElementById('hcLoading').style.display = 'none';
    document.getElementById('hcContainer').style.display = 'block';
  }, 50);
}

function _renderHilalChart(dataList, hYear) {
  const ctx = document.getElementById('hilalChartCanvas');
  if (!ctx) return;

  const labels = ['Muharram', 'Shafar', 'Rabiul Awal', 'Rabiul Akhir', 'Jumadil Awal', 'Jumadil Akhir', 'Rajab', "Sya'ban", 'Ramadan', 'Syawal', "Dzulqa'dah", 'Dzulhijjah'];
  
  const altData = dataList.map(d => d.altMoonGeo);
  const eloData = dataList.map(d => d.elongGeo);

  // Buat array warna sesuai status IRNU (hijau = visibel, merah = tidak)
  const altColors = dataList.map(d => d.irnu_vis ? 'rgba(100, 217, 156, 0.8)' : 'rgba(242, 107, 107, 0.8)');
  
  if (hilalChartInstance) {
    hilalChartInstance.destroy();
  }

  // Check if Chart is defined (loaded via CDN)
  if (typeof Chart === 'undefined') {
    ctx.parentNode.innerHTML = '<div style="color:var(--amber);text-align:center">Gagal memuat Chart.js. Pastikan koneksi internet aktif.</div>';
    return;
  }

  // Chart configuration
  hilalChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Tinggi Hilal (°)',
          data: altData,
          backgroundColor: altColors,
          borderColor: altColors.map(c => c.replace('0.8', '1')),
          borderWidth: 1,
          order: 2,
          yAxisID: 'y'
        },
        {
          label: 'Elongasi (°)',
          data: eloData,
          type: 'line',
          borderColor: 'rgba(252, 225, 141, 1)', // var(--gold2)
          backgroundColor: 'rgba(252, 225, 141, 0.2)',
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: 'rgba(252, 225, 141, 1)',
          tension: 0.3,
          order: 1,
          yAxisID: 'y'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      color: '#a0a0a0', // var(--text3)
      plugins: {
        title: {
          display: true,
          text: `Grafik Visibilitas Hilal ${hYear} H`,
          color: '#fcb13b', // var(--amber)
          font: { size: 16, family: "'Inter', sans-serif" }
        },
        legend: {
          labels: { color: '#e0e0e0', font: { family: "'Inter', sans-serif" } }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) label += ': ';
              if (context.parsed.y !== null) {
                label += context.parsed.y.toFixed(2) + '°';
              }
              return label;
            }
          }
        },
        annotation: { // Kita tidak pakai plugin anotasi external untuk simplicity, 
          // tapi kita bisa gambar garis referensi via custom plugin
        }
      },
      scales: {
        x: {
          ticks: { color: '#a0a0a0', font: { family: "'Inter', sans-serif" } },
          grid: { color: 'rgba(255,255,255,0.05)' }
        },
        y: {
          title: { display: true, text: 'Derajat (°)', color: '#a0a0a0' },
          ticks: { color: '#a0a0a0', font: { family: "'Inter', sans-serif" } },
          grid: { color: 'rgba(255,255,255,0.05)' }
        }
      }
    },
    plugins: [{
      id: 'customReferenceLines',
      beforeDraw: chart => {
        const { ctx, chartArea: { top, bottom, left, right }, scales: { x, y } } = chart;
        
        // Garis batas IRNU (Tinggi 3°, Elongasi 6.4°)
        const alt3Y = y.getPixelForValue(3);
        const elo64Y = y.getPixelForValue(6.4);
        
        ctx.save();
        
        // Garis Tinggi 3°
        if (alt3Y >= top && alt3Y <= bottom) {
          ctx.beginPath();
          ctx.moveTo(left, alt3Y);
          ctx.lineTo(right, alt3Y);
          ctx.lineWidth = 1;
          ctx.strokeStyle = 'rgba(100, 217, 156, 0.5)'; // Greenish
          ctx.setLineDash([5, 5]);
          ctx.stroke();
          ctx.fillStyle = 'rgba(100, 217, 156, 0.8)';
          ctx.font = "10px sans-serif";
          ctx.fillText("T=3° (IRNU)", right - 60, alt3Y - 5);
        }

        // Garis Elongasi 6.4°
        if (elo64Y >= top && elo64Y <= bottom) {
          ctx.beginPath();
          ctx.moveTo(left, elo64Y);
          ctx.lineTo(right, elo64Y);
          ctx.lineWidth = 1;
          ctx.strokeStyle = 'rgba(252, 225, 141, 0.5)'; // Goldish
          ctx.setLineDash([5, 5]);
          ctx.stroke();
          ctx.fillStyle = 'rgba(252, 225, 141, 0.8)';
          ctx.font = "10px sans-serif";
          ctx.fillText("E=6.4° (IRNU/Odeh)", right - 95, elo64Y - 5);
        }

        ctx.restore();
      }
    }]
  });
}

function _renderSyncTable(dataList, hYear) {
  const el = document.getElementById('hcSyncBody');
  if (!el) return;

  const labels = ['Muharram', 'Shafar', 'Rabiul Awal', 'Rabiul Akhir', 'Jumadil Awal', 'Jumadil Akhir', 'Rajab', "Sya'ban", 'Ramadan', 'Syawal', "Dzulqa'dah", 'Dzulhijjah'];
  const MON3 = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
  
  let html = '';
  dataList.forEach((d, i) => {
    // Tanggal prediksi awal bulan (berdasarkan kriteria IRNU yang dievaluasi di calcHilal)
    const pDate = d.predGreg;
    const dateStr = pDate ? `${pDate.day} ${MON3[pDate.month-1]} ${pDate.year}` : '—';
    const irnuStatus = d.irnu_vis ? '<span style="color:var(--green)">✓ IRNU</span>' : '<span style="color:var(--red)">✗ IRNU</span>';
    const odehStatus = d.qOdeh >= 2 ? '<span style="color:var(--green)">✓ Odeh</span>' : '<span style="color:var(--text3)">✗ Odeh</span>';

    html += `<tr>
      <td style="color:var(--gold2)">${labels[i]}</td>
      <td>${dateStr}</td>
      <td>${d.altMoonGeo.toFixed(2)}°</td>
      <td>${d.elongGeo.toFixed(2)}°</td>
      <td>${irnuStatus} <span style="margin:0 4px;color:var(--border)">|</span> ${odehStatus}</td>
    </tr>`;
  });

  el.innerHTML = html;
}
