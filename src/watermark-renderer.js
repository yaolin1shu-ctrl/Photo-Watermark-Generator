import { WATERMARK_TEMPLATE } from './template.js';
import { calculateCoverDrawRect, drawImageCover, loadImageFromSrc, normalizeRotationDegrees } from './utils.js';

let watermarkAssetPromise = null;

export function resetCanvas(canvas) {
  const context = canvas.getContext('2d');

  prepareCanvas(canvas, WATERMARK_TEMPLATE.canvas);

  context.fillStyle = '#111827';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = '#94a3b8';
  context.font = '42px "Microsoft YaHei", Arial, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('\u8bf7\u5148\u4e0a\u4f20\u56fe\u7247', canvas.width / 2, canvas.height / 2);
}

export function drawImageCoverToCanvas(canvas, image, canvasSize = WATERMARK_TEMPLATE.canvas, options = {}) {
  const context = canvas.getContext('2d');

  prepareCanvas(canvas, canvasSize);
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawRotatedImageCover(context, image, canvas.width, canvas.height, options.rotationDegrees);
}

export const drawImageCoverCanvas = drawImageCoverToCanvas;

export async function renderWatermark(canvas, image, data, template = WATERMARK_TEMPLATE, options = {}) {
  const context = canvas.getContext('2d');

  prepareCanvas(canvas, template.canvas);
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawRotatedImageCover(context, image, canvas.width, canvas.height, options.rotationDegrees);
  await drawWatermarkAsset(context, template.watermark.asset);
  drawDynamicWatermarkText(context, data, template.watermark.elements);

  return createDebugRects(template);
}

export function canvasToJpgDataUrl(canvas, quality = 0.95) {
  return canvas.toDataURL('image/jpeg', quality);
}

export { calculateCoverDrawRect };

function prepareCanvas(canvas, canvasSize) {
  canvas.width = canvasSize.width;
  canvas.height = canvasSize.height;
}

function drawRotatedImageCover(context, image, targetWidth, targetHeight, rotationDegrees = 0) {
  const normalizedDegrees = normalizeRotationDegrees(rotationDegrees);

  if (normalizedDegrees === 0) {
    return drawImageCover(context, image, targetWidth, targetHeight);
  }

  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const quarterTurn = normalizedDegrees === 90 || normalizedDegrees === 270;
  const rotatedWidth = quarterTurn ? sourceHeight : sourceWidth;
  const rotatedHeight = quarterTurn ? sourceWidth : sourceHeight;
  const scale = Math.max(targetWidth / rotatedWidth, targetHeight / rotatedHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  const rotatedDrawWidth = rotatedWidth * scale;
  const rotatedDrawHeight = rotatedHeight * scale;

  context.save();
  context.translate(targetWidth / 2, targetHeight / 2);
  context.rotate((normalizedDegrees * Math.PI) / 180);
  context.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
  context.restore();

  return {
    x: (targetWidth - rotatedDrawWidth) / 2,
    y: (targetHeight - rotatedDrawHeight) / 2,
    width: rotatedDrawWidth,
    height: rotatedDrawHeight
  };
}

async function drawWatermarkAsset(context, assetConfig) {
  const asset = await loadWatermarkAsset(assetConfig.path);

  context.save();
  context.globalAlpha = assetConfig.opacity ?? 1;
  context.drawImage(asset, assetConfig.x, assetConfig.y, assetConfig.width, assetConfig.height);
  context.restore();
}

function loadWatermarkAsset(path) {
  if (!watermarkAssetPromise) {
    watermarkAssetPromise = loadImageFromSrc(path);
  }

  return watermarkAssetPromise;
}

function drawDynamicWatermarkText(context, data, elements) {
  drawText(context, data.time, elements.badge, {
    x: elements.badge.textX,
    y: elements.badge.textY,
    width: elements.badge.width
  });
  drawText(context, data.location, elements.location);
  drawText(context, data.dateLine, elements.dateLine);
  if (elements.noteLine.enabled !== false) {
    drawText(context, `${data.weather} ${data.temperature}`, elements.noteLine);
  }
  drawText(context, data.antiFakeId, elements.rightBlock, {
    x: elements.rightBlock.textX,
    y: elements.rightBlock.textY,
    width: elements.rightBlock.textWidth
  });
}

function drawText(context, text, style, override = {}) {
  context.save();
  applyShadow(context, style);
  context.globalAlpha = style.opacity ?? 1;
  context.font = `${style.fontWeight ?? 400} ${style.fontSize}px ${style.fontFamily}`;
  context.textAlign = style.align ?? 'left';
  context.textBaseline = style.baseline ?? 'top';

  const x = override.x ?? style.x;
  const y = override.y ?? style.y;
  const width = override.width ?? style.width;
  const textX = style.align === 'right' ? x + width : x;
  const scaleX = style.scaleX ?? 1;

  if (scaleX !== 1) {
    context.translate(textX, y);
    context.scale(scaleX, 1);
    context.fillStyle = createFillStyle(context, style, 0, width);
    context.fillText(text, 0, 0);
  } else {
    context.fillStyle = createFillStyle(context, style, textX, width);
    context.fillText(text, textX, y);
  }

  context.restore();
}

function createFillStyle(context, style, x, width) {
  if (!style.gradient) {
    return style.color;
  }

  const gradient = context.createLinearGradient(x, 0, x + width, 0);
  gradient.addColorStop(0, style.gradient[0]);
  gradient.addColorStop(1, style.gradient[1]);
  return gradient;
}

function applyShadow(context, style) {
  context.shadowColor = style.shadowColor ?? 'transparent';
  context.shadowBlur = style.shadowBlur ?? 0;
  context.shadowOffsetX = style.shadowOffsetX ?? 0;
  context.shadowOffsetY = style.shadowOffsetY ?? 0;
}

function createDebugRects(template) {
  return Object.fromEntries(
    Object.entries(template.watermark.elements).map(([name, item]) => [
      name,
      {
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height
      }
    ])
  );
}
