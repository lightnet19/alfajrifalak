export function getIRNUCriteria({ altitude, elongation }) {
  const memenuhi = altitude >= 3 && elongation >= 6.4;
  return {
    altitude,
    elongation,
    memenuhi,
    keterangan: memenuhi ? "Memenuhi Kriteria IRNU (NU)" : "Belum Memenuhi Kriteria IRNU",
  };
}
