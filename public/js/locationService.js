export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation tidak didukung oleh browser ini."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => reject(new Error(err.message || "Gagal mengambil lokasi")),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}
