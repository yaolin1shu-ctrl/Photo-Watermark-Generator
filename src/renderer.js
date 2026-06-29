import { DEFAULT_FORM_VALUES, WATERMARK_TEMPLATE } from './template.js';
import { canvasToJpgDataUrl, renderWatermark, resetCanvas } from './watermark-renderer.js';
import {
  formatCurrentRealTime,
  formatDateInputValue,
  formatDateLine,
  formatTime,
  generateDefaultExportFilename,
  generateRandomString,
  loadImageFromFile,
  normalizeRotationDegrees
} from './utils.js';

const elements = {};
let uploadedImage = null;
let uploadedFileName = '';
let antiFakeId = generateRandomString(14);
let imageRotationDegrees = 0;
let runtimeTemplate = cloneTemplate(WATERMARK_TEMPLATE);
let dragState = null;
const WATERMARK_SETTINGS_KEY = 'watermark-template-adjustments-v1';

document.addEventListener('DOMContentLoaded', () => {
  cacheElements();
  runtimeTemplate = loadSavedTemplate();
  initializeForm();
  showStartupNotice();
  resetCanvas(elements.previewCanvas);
  prepareAdjustCanvas();
  bindEvents();
  updatePositionReadout();
});

function showStartupNotice() {
  window.alert('该软件完全免费，开源，且本项目仅供学习参考，切勿非法使用，否则后果自负。再次感谢：小天南代码开源支持');
}

function cacheElements() {
  elements.imageInput = document.getElementById('imageInput');
  elements.rotationSelect = document.getElementById('rotationSelect');
  elements.dateInput = document.getElementById('dateInput');
  elements.timeInput = document.getElementById('timeInput');
  elements.dateLinePreview = document.getElementById('dateLinePreview');
  elements.locationInput = document.getElementById('locationInput');
  elements.adjustTargetSelect = document.getElementById('adjustTargetSelect');
  elements.nudgeStepInput = document.getElementById('nudgeStepInput');
  elements.positionReadout = document.getElementById('positionReadout');
  elements.savePositionsButton = document.getElementById('savePositionsButton');
  elements.resetPositionsButton = document.getElementById('resetPositionsButton');
  elements.generatePreviewButton = document.getElementById('generatePreviewButton');
  elements.exportJpgButton = document.getElementById('exportJpgButton');
  elements.previewCanvas = document.getElementById('previewCanvas');
  elements.adjustCanvas = document.getElementById('adjustCanvas');
}

function initializeForm() {
  const now = new Date();

  elements.dateInput.value = formatDateInputValue(now);
  elements.timeInput.value = formatTime(now);
  elements.locationInput.value = DEFAULT_FORM_VALUES.location;
  runtimeTemplate.watermark.elements.noteLine.enabled = false;
  runtimeTemplate.watermark.elements.noteLine.opacity = 0;
  updateDateLinePreview();
}

function bindEvents() {
  elements.imageInput.addEventListener('change', handleImageUpload);
  elements.rotationSelect.addEventListener('change', () => {
    imageRotationDegrees = normalizeRotationDegrees(elements.rotationSelect.value);
    void generatePreview();
  });
  elements.dateInput.addEventListener('input', () => {
    updateDateLinePreview();
    void generatePreview();
  });
  elements.timeInput.addEventListener('input', () => void generatePreview());
  elements.locationInput.addEventListener('input', () => void generatePreview());
  elements.adjustTargetSelect.addEventListener('change', updatePositionReadout);
  elements.generatePreviewButton.addEventListener('click', () => {
    antiFakeId = generateRandomString(14);
    void generatePreview();
  });
  elements.savePositionsButton.addEventListener('click', () => {
    saveTemplateAdjustments();
    window.alert('微调设置已保存，下次打开会自动恢复。');
  });
  elements.resetPositionsButton.addEventListener('click', () => {
    runtimeTemplate = cloneTemplate(WATERMARK_TEMPLATE);
    runtimeTemplate.watermark.elements.noteLine.enabled = false;
    runtimeTemplate.watermark.elements.noteLine.opacity = 0;
    clearTemplateAdjustments();
    void generatePreview();
  });
  elements.exportJpgButton.addEventListener('click', () => void exportPreview());
  elements.adjustCanvas.addEventListener('pointerdown', startDrag);
  elements.adjustCanvas.addEventListener('pointermove', continueDrag);
  elements.adjustCanvas.addEventListener('pointerup', endDrag);
  elements.adjustCanvas.addEventListener('pointercancel', endDrag);
  document.addEventListener('keydown', handleArrowNudge);
}

function updateDateLinePreview() {
  if (!elements.dateInput.value) {
    elements.dateLinePreview.textContent = '\u8bf7\u9009\u62e9\u65e5\u671f';
    return;
  }

  elements.dateLinePreview.textContent = formatDateLine(elements.dateInput.value);
}

async function handleImageUpload(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  uploadedFileName = file.name;
  uploadedImage = await loadImageFromFile(file);
  imageRotationDegrees = 0;
  elements.rotationSelect.value = '0';
  await generatePreview();
}

async function generatePreview() {
  if (!uploadedImage) {
    resetCanvas(elements.previewCanvas);
    updatePositionReadout();
    return;
  }

  await renderWatermark(elements.previewCanvas, uploadedImage, getWatermarkData(), runtimeTemplate, {
    rotationDegrees: imageRotationDegrees
  });
  updatePositionReadout();
}

function getWatermarkData() {
  return {
    time: elements.timeInput.value,
    location: elements.locationInput.value,
    dateLine: formatDateLine(elements.dateInput.value),
    weather: '',
    temperature: '',
    realTime: formatCurrentRealTime(new Date()),
    antiFakeId
  };
}

async function exportPreview() {
  if (!uploadedImage) {
    window.alert('\u8bf7\u5148\u4e0a\u4f20\u56fe\u7247');
    return;
  }

  await renderWatermark(elements.previewCanvas, uploadedImage, getWatermarkData(), runtimeTemplate, {
    rotationDegrees: imageRotationDegrees
  });
  saveTemplateAdjustments();

  const result = await window.electronApp.saveJpg({
    dataUrl: canvasToJpgDataUrl(elements.previewCanvas, 0.95),
    defaultFileName: generateDefaultExportFilename(elements.dateInput.value, uploadedFileName)
  });

  if (!result.canceled) {
    window.alert(`\u5bfc\u51fa\u5b8c\u6210\uff1a${result.filePath}`);
  }

  await generatePreview();
}

function startDrag(event) {
  elements.adjustCanvas.focus();
  const point = getCanvasPoint(event);
  const target = getAdjustTarget();

  dragState = {
    target,
    lastX: point.x,
    lastY: point.y
  };
  elements.adjustCanvas.setPointerCapture(event.pointerId);
}

function continueDrag(event) {
  if (!dragState) {
    return;
  }

  const point = getCanvasPoint(event);
  const dx = Math.round(point.x - dragState.lastX);
  const dy = Math.round(point.y - dragState.lastY);

  if (dx !== 0 || dy !== 0) {
    moveTarget(dragState.target, dx, dy);
    dragState.lastX = point.x;
    dragState.lastY = point.y;
    void generatePreview();
  }
}

function endDrag(event) {
  if (!dragState) {
    return;
  }

  elements.adjustCanvas.releasePointerCapture?.(event.pointerId);
  dragState = null;
}

function handleArrowNudge(event) {
  const deltas = {
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
    ArrowUp: [0, -1],
    ArrowDown: [0, 1]
  };

  if (!(event.key in deltas)) {
    return;
  }

  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
    return;
  }

  event.preventDefault();
  const [x, y] = deltas[event.key];
  const step = getNudgeStep() * (event.shiftKey ? 10 : 1);
  moveTarget(getAdjustTarget(), x * step, y * step);
  void generatePreview();
}

function moveTarget(target, dx, dy) {
  moveElement(target, dx, dy);
}

function moveElement(name, dx, dy) {
  const item = runtimeTemplate.watermark.elements[name];
  if (!item) {
    return;
  }

  item.x += dx;
  item.y += dy;

  if ('textX' in item) {
    item.textX += dx;
  }
  if ('textY' in item) {
    item.textY += dy;
  }
  saveTemplateAdjustments();
}

function updatePositionReadout() {
  if (!elements.positionReadout) {
    return;
  }

  const target = getAdjustTarget();
  const rect = getTargetRect(target);
  elements.positionReadout.textContent = `${target}\nx: ${Math.round(rect.x)}, y: ${Math.round(rect.y)}\nw: ${Math.round(rect.width)}, h: ${Math.round(rect.height)}`;
}

function getTargetRect(target) {
  return runtimeTemplate.watermark.elements[target] ?? runtimeTemplate.watermark.elements.badge;
}

function getAdjustTarget() {
  return elements.adjustTargetSelect?.value ?? 'badge';
}

function getNudgeStep() {
  return Math.max(1, Number(elements.nudgeStepInput.value) || 1);
}

function getCanvasPoint(event) {
  const rect = elements.adjustCanvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * elements.adjustCanvas.width,
    y: ((event.clientY - rect.top) / rect.height) * elements.adjustCanvas.height
  };
}

function cloneTemplate(template) {
  return structuredClone(template);
}

function prepareAdjustCanvas() {
  elements.adjustCanvas.width = runtimeTemplate.canvas.width;
  elements.adjustCanvas.height = runtimeTemplate.canvas.height;
  elements.adjustCanvas.getContext('2d').clearRect(0, 0, elements.adjustCanvas.width, elements.adjustCanvas.height);
}

function loadSavedTemplate() {
  const template = cloneTemplate(WATERMARK_TEMPLATE);

  try {
    const saved = JSON.parse(localStorage.getItem(WATERMARK_SETTINGS_KEY) || 'null');
    if (!saved?.elements) {
      return template;
    }

    for (const [name, adjustment] of Object.entries(saved.elements)) {
      if (!template.watermark.elements[name]) {
        continue;
      }
      Object.assign(template.watermark.elements[name], pickTemplateAdjustment(adjustment));
    }

    template.watermark.elements.noteLine.enabled = false;
    template.watermark.elements.noteLine.opacity = 0;
    return template;
  } catch (error) {
    console.warn('Failed to load watermark adjustments.', error);
    return template;
  }
}

function saveTemplateAdjustments() {
  const elements = runtimeTemplate.watermark.elements;
  const payload = {
    elements: Object.fromEntries(
      Object.entries(elements).map(([name, item]) => [name, pickTemplateAdjustment(item)])
    ),
    savedAt: new Date().toISOString()
  };

  localStorage.setItem(WATERMARK_SETTINGS_KEY, JSON.stringify(payload));
}

function clearTemplateAdjustments() {
  localStorage.removeItem(WATERMARK_SETTINGS_KEY);
}

function pickTemplateAdjustment(item) {
  const keys = ['x', 'y', 'width', 'height', 'textX', 'textY', 'textWidth', 'fontSize', 'lineHeight', 'opacity'];
  return Object.fromEntries(keys.filter((key) => key in item).map((key) => [key, item[key]]));
}
