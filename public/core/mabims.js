export function getMabimsCriteria({ altitude, elongation }) {
  const memenuhi = altitude >= 3 && elongation >= 6.4;
  return {
    altitude,
    elongation,
    memenuhi,
    keterangan: memenuhi ? "Memenuhi Kriteria MABIMS" : "Belum Memenuhi Kriteria MABIMS",
  };
}
