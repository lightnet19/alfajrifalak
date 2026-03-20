const KEY = "ALFAJRI_MARKAZ_LIST";

// ambil semua
export function getMarkazList() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

// simpan semua
function save(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

// tambah
export function addMarkaz(m) {
  const list = getMarkazList();
  list.push({
    name: m.name || "Tanpa Nama",
    lat: Number(m.lat),
    lon: Number(m.lon),
    elevation: Number(m.elevation || 0),
    tz: Number(m.tz || 7),
  });
  save(list);
}

// hapus by index
export function deleteMarkaz(index) {
  const list = getMarkazList();
  list.splice(index, 1);
  save(list);
}

// ambil satu
export function getMarkaz(index) {
  const list = getMarkazList();
  return list[index];
}
