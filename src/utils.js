export const WEEKDAY_LABELS = [
  '\u661f\u671f\u65e5',
  '\u661f\u671f\u4e00',
  '\u661f\u671f\u4e8c',
  '\u661f\u671f\u4e09',
  '\u661f\u671f\u56db',
  '\u661f\u671f\u4e94',
  '\u661f\u671f\u516d'
];

export function padTwoDigits(value) {
  return String(value).padStart(2, '0');
}

export function formatTime(date = new Date()) {
  return `${padTwoDigits(date.getHours())}:${padTwoDigits(date.getMinutes())}`;
}

export function formatDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = padTwoDigits(date.getMonth() + 1);
  const day = padTwoDigits(date.getDate());

  return `${year}-${month}-${day}`;
}

export function getChineseWeekday(dateStr) {
  const date = parseDateInputValue(dateStr);
  return WEEKDAY_LABELS[date.getDay()];
}

export function formatDateLine(dateStr) {
  const date = parseDateInputValue(dateStr);
  const year = date.getFullYear();
  const month = padTwoDigits(date.getMonth() + 1);
  const day = padTwoDigits(date.getDate());

  return `${year}.${month}.${day} ${getChineseWeekday(dateStr)}`;
}

export function getWeekday(date = new Date()) {
  return WEEKDAY_LABELS[date.getDay()];
}

export function formatDateWithWeekday(date = new Date()) {
  const year = date.getFullYear();
  const month = padTwoDigits(date.getMonth() + 1);
  const day = padTwoDigits(date.getDate());

  return `${year}.${month}.${day} ${getWeekday(date)}`;
}

export function generateRandomString(length = 14) {
  const characters = 'ABCDEFGHIJKMNOPQRSTUVWXYZ0123456789';
  let result = '';

  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}

export function formatCurrentRealTime(date = new Date()) {
  const year = date.getFullYear();
  const month = padTwoDigits(date.getMonth() + 1);
  const day = padTwoDigits(date.getDate());
  const hours = padTwoDigits(date.getHours());
  const minutes = padTwoDigits(date.getMinutes());
  const seconds = padTwoDigits(date.getSeconds());

  return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
}

export function generateDefaultExportFilename(dateStr, originalFilename = 'watermark.jpg') {
  const extensionIndex = originalFilename.lastIndexOf('.');
  const baseName = extensionIndex > 0 ? originalFilename.slice(0, extensionIndex) : originalFilename;
  const safeBaseName = (baseName || 'watermark').replace(/[<>:"/\\|?*]/g, '_');

  return `${dateStr}_${safeBaseName}.jpg`;
}

export function normalizeRotationDegrees(value = 0) {
  const numericValue = Number(value) || 0;
  return ((numericValue % 360) + 360) % 360;
}

export function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      loadImageFromSrc(reader.result).then(resolve, reject);
    };

    reader.readAsDataURL(file);
  });
}

export function loadImageFromSrc(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = src;
  });
}

export function calculateCoverDrawRect(sourceWidth, sourceHeight, targetWidth, targetHeight) {
  const scale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const width = Math.round(sourceWidth * scale);
  const height = Math.round(sourceHeight * scale);

  return {
    x: (targetWidth - width) / 2,
    y: (targetHeight - height) / 2,
    width,
    height
  };
}

export function drawImageCover(context, image, targetWidth, targetHeight) {
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const drawRect = calculateCoverDrawRect(sourceWidth, sourceHeight, targetWidth, targetHeight);

  context.drawImage(image, drawRect.x, drawRect.y, drawRect.width, drawRect.height);
  return drawRect;
}

function parseDateInputValue(dateStr) {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);

  if (!parts) {
    throw new Error(`Invalid date string: ${dateStr}`);
  }

  const year = Number(parts[1]);
  const month = Number(parts[2]);
  const day = Number(parts[3]);
  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    throw new Error(`Invalid date string: ${dateStr}`);
  }

  return date;
}
