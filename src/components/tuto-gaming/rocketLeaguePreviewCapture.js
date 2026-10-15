export async function captureRocketLeaguePreview(element, html2canvas) {
  if (!element || typeof html2canvas !== 'function') {
    throw new TypeError('Aperçu Rocket League indisponible.');
  }
  const canvas = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('La capture de l’aperçu a expiré.')), 10_000);
    html2canvas(element, {
      backgroundColor: null,
      scale: 2,
      useCORS: false,
      allowTaint: false,
      imageTimeout: 5_000,
    }).then(
      value => {
        clearTimeout(timeout);
        resolve(value);
      },
      error => {
        clearTimeout(timeout);
        reject(error);
      },
    );
  });
  const blob = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('L’encodage de l’aperçu a expiré.')), 5_000);
    canvas.toBlob(value => {
      clearTimeout(timeout);
      resolve(value);
    }, 'image/png');
  });
  if (!blob) throw new Error('Capture Rocket League vide.');
  return blob;
}
