export function getMuhammadiyahCriteria({ altitude, ijtima, sunset }) {
  if (!ijtima || sunset == null) {
    return {
      memenuhi: false,
      keterangan: "Data tidak lengkap",
    };
  }

  const ijtimaHour =
    ijtima.getHours() + ijtima.getMinutes() / 60 + ijtima.getSeconds() / 3600;

  const memenuhi = ijtimaHour < sunset && altitude > 0;

  return {
    memenuhi,
    keterangan: memenuhi ? "Memenuhi Wujudul Hilal" : "Belum Memenuhi Wujudul Hilal",
  };
}
