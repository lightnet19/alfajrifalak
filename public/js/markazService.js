const KEY = "ALFAJRI_MARKAZ_V1";

export function getMarkazList() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function saveMarkazList(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function addMarkaz(markaz) {
  const list = getMarkazList();
  const existingIndex = list.findIndex(
    (m) => m.name.trim().toLowerCase() === markaz.name.trim().toLowerCase()
  );

  if (existingIndex >= 0) list[existingIndex] = markaz;
  else list.push(markaz);

  saveMarkazList(list);
}

export function deleteMarkaz(index) {
  const list = getMarkazList();
  if (index >= 0 && index < list.length) {
    list.splice(index, 1);
    saveMarkazList(list);
  }
}
