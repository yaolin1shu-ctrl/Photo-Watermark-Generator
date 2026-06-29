import { DEBUG_ELEMENT_NAMES, WATERMARK_TEMPLATE } from './template.js';
import { drawImageCover } from './utils.js';

export function createOverlayDebugController({
  referenceCanvas,
  previewCanvas,
  debugCanvas,
  template = WATERMARK_TEMPLATE
}) {
  const state = {
    referenceImage: null,
    showReference: true,
    previewOpacity: 0.5,
    showDebug: false,
    elementVisibility: createDefaultElementVisibility()
  };

  prepareOverlayCanvas(referenceCanvas, template);
  prepareOverlayCanvas(debugCanvas, template);
  setPreviewOpacity(state.previewOpacity);

  function setReferenceImage(image) {
    state.referenceImage = image;
    drawReferenceImage();
  }

  function setShowReference(visible) {
    state.showReference = visible;
    referenceCanvas.style.display = visible ? 'block' : 'none';
    drawReferenceImage();
  }

  function setPreviewOpacity(opacity) {
    state.previewOpacity = Number(opacity);
    previewCanvas.style.opacity = String(state.previewOpacity);
  }

  function setShowDebug(visible, rects = {}) {
    state.showDebug = visible;
    drawDebugOverlay(rects);
  }

  function setElementVisible(name, visible, rects = {}) {
    state.elementVisibility[name] = visible;
    drawDebugOverlay(rects);
  }

  function drawReferenceImage() {
    const context = referenceCanvas.getContext('2d');
    context.clearRect(0, 0, referenceCanvas.width, referenceCanvas.height);

    if (state.referenceImage && state.showReference) {
      drawImageCover(context, state.referenceImage, referenceCanvas.width, referenceCanvas.height);
    }
  }

  function drawDebugOverlay(rects = {}) {
    const context = debugCanvas.getContext('2d');
    context.clearRect(0, 0, debugCanvas.width, debugCanvas.height);

    if (!state.showDebug) {
      return;
    }

    drawGuideLines(context, template);
    drawCanvasBorder(context, template);

    for (const [name, rect] of Object.entries(rects)) {
      if (state.elementVisibility[name]) {
        drawDebugBox(context, name, rect, template);
      }
    }
  }

  return {
    state,
    setReferenceImage,
    setShowReference,
    setPreviewOpacity,
    setShowDebug,
    setElementVisible,
    drawReferenceImage,
    drawDebugOverlay
  };
}

export function createDefaultElementVisibility() {
  return Object.fromEntries(DEBUG_ELEMENT_NAMES.map((name) => [name, true]));
}

function prepareOverlayCanvas(canvas, template) {
  canvas.width = template.canvas.width;
  canvas.height = template.canvas.height;
}

function drawGuideLines(context, template) {
  const { width, height } = template.canvas;
  const { guideColor, guideStep, lineWidth } = template.debug;

  context.save();
  context.strokeStyle = guideColor;
  context.lineWidth = lineWidth;
  context.setLineDash([10, 10]);

  for (let x = guideStep; x < width; x += guideStep) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }

  for (let y = guideStep; y < height; y += guideStep) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }

  context.restore();
}

function drawCanvasBorder(context, template) {
  context.save();
  context.strokeStyle = template.debug.canvasBorderColor;
  context.lineWidth = 4;
  context.strokeRect(2, 2, template.canvas.width - 4, template.canvas.height - 4);
  context.restore();
}

function drawDebugBox(context, name, rect, template) {
  context.save();
  context.strokeStyle = template.debug.elementBorderColor;
  context.lineWidth = 3;
  context.setLineDash([]);
  context.strokeRect(rect.x, rect.y, rect.width, rect.height);

  context.fillStyle = template.debug.labelBackground;
  context.fillRect(rect.x, rect.y - 22, Math.max(92, name.length * 9), 22);
  context.fillStyle = template.debug.labelColor;
  context.font = '16px Consolas, monospace';
  context.textAlign = 'left';
  context.textBaseline = 'middle';
  context.fillText(name, rect.x + 5, rect.y - 11);
  context.restore();
}
