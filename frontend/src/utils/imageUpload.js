// Client-side photo handling for the prototype (no backend yet).
// The picked file is resized and compressed in the browser and kept as a data URL,
// so it fits in localStorage. In production, replace `prepareUploadedPhoto` with an
// upload to cloud storage that returns the public URL — callers only need a string.

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_BYTES = 10 * 1024 * 1024;

export class ImageUploadError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ImageUploadError';
  }
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new ImageUploadError('Não foi possível ler esta imagem. Tente outra foto em JPG, PNG ou WebP.'));
    };
    img.src = url;
  });
}

/**
 * Validates, center-crops to a square and compresses the photo.
 * @returns {Promise<string>} JPEG data URL (about 40–90 KB)
 */
export async function prepareUploadedPhoto(file, size = 640, quality = 0.82) {
  if (!file) throw new ImageUploadError('Nenhum arquivo selecionado.');
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) throw new ImageUploadError('Formato não suportado. Use uma foto em JPG, PNG ou WebP.');
  if (file.size > MAX_FILE_BYTES) throw new ImageUploadError('A foto é muito grande. Escolha uma imagem de até 10 MB.');

  const img = await loadImage(file);
  const side = Math.min(img.naturalWidth, img.naturalHeight);
  const target = Math.min(size, side);
  const canvas = document.createElement('canvas');
  canvas.width = target;
  canvas.height = target;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, target, target);
  return canvas.toDataURL('image/jpeg', quality);
}

export const isUploadedPhoto = (src) => typeof src === 'string' && src.startsWith('data:image/');
