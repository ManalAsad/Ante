export const MAX_PHOTO_LENGTH = 500_000;

// Accept embedded raster images only; no remote URLs or executable SVG content.
export function validatePhoto(photo) {
  if (photo == null || photo === '') return null;
  if (typeof photo !== 'string' || photo.length > MAX_PHOTO_LENGTH || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(photo)) {
    throw new Error('Choose a valid JPG, PNG, or WebP photo. The saved photo must be smaller than 500 KB.');
  }
  return photo;
}

export function validatePhotoPosition(value = 50) {
  if (!Number.isFinite(value) || value < 0 || value > 100) throw new Error('Choose a valid photo position.');
  return value;
}
