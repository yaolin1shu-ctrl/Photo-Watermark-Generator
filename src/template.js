const FONT_FAMILY = '"Microsoft YaHei", "Microsoft JhengHei", SimHei, Arial, sans-serif';

const SHADOW = {
  shadowColor: 'rgba(0, 0, 0, 0.45)',
  shadowBlur: 5,
  shadowOffsetX: 0,
  shadowOffsetY: 2
};

export const DEBUG_ELEMENT_NAMES = ['badge', 'yellowBar', 'location', 'dateLine', 'noteLine', 'rightBlock'];

// Original CSS coordinates were measured on a 380 x 500 preview area.
// These ratios map those values to the fixed 1279 x 1706 export canvas.
const FW_FONT_SIZE = 6.5;
const SCALE_Y = 1706 / 500;
const sourceToCanvasFont = (value) => Math.round(value * SCALE_Y);

export const WATERMARK_TEMPLATE = {
  canvas: {
    width: 1279,
    height: 1706
  },
  image: {
    fit: 'cover'
  },
  debug: {
    guideColor: 'rgba(0, 180, 255, 0.45)',
    canvasBorderColor: 'rgba(255, 255, 0, 0.95)',
    elementBorderColor: 'rgba(255, 0, 0, 0.95)',
    labelColor: 'rgba(255, 255, 255, 0.95)',
    labelBackground: 'rgba(255, 0, 0, 0.75)',
    lineWidth: 2,
    guideStep: 100
  },
  watermark: {
    asset: {
      path: 'assets/真实可验背景图.png',
      x: -10,
      y: 1300,
      width: 1279,
      height: 402,
      opacity: 1
    },
    elements: {
      badge: {
        x: 25,
        y: 1329,
        width: 330,
        height: 102,
        textX: 172,
        textY: 1342,
        color: '#1457bd',
        fontSize: 75,
        fontWeight: 800,
        fontFamily: FONT_FAMILY,
        lineHeight: 102,
        opacity: 1,
        scaleX: 0.8,
        gradient: ['#2d7df0', '#111827'],
        shadowColor: 'rgba(255, 255, 255, 0.88)',
        shadowBlur: 3,
        shadowOffsetX: 0,
        shadowOffsetY: 0
      },
      yellowBar: {
        x: 26,
        y: 1456,
        width: 9,
        height: 152,
        fontSize: 1,
        lineHeight: 1,
        opacity: 1,
        shadowBlur: 0
      },
      location: {
        x: 62,
        y: 1470,
        width: 910,
        height: 61,
        color: '#ffffff',
        fontSize: 55,
        fontWeight: 700,
        fontFamily: FONT_FAMILY,
        lineHeight: 61,
        opacity: 1,
        scaleX: 0.9,
        ...SHADOW
      },
      dateLine: {
        x: 62,
        y: 1555,
        width: 740,
        height: 61,
        color: '#ffffff',
        fontSize: 51,
        fontWeight: 500,
        fontFamily: FONT_FAMILY,
        lineHeight: 61,
        opacity: 0.98,
        ...SHADOW
      },
      noteLine: {
        x: 62,
        y: 1622,
        width: 760,
        height: 51,
        color: '#ffffff',
        fontSize: 41,
        fontWeight: 500,
        fontFamily: FONT_FAMILY,
        lineHeight: 51,
        opacity: 0,
        enabled: false,
        ...SHADOW
      },
      rightBlock: {
        x: 1092,
        y: 1674,
        width: 175,
        height: 28,
        textX: 1092,
        textY: 1674,
        textWidth: 175,
        color: '#ffffff',
        fontSize: sourceToCanvasFont(FW_FONT_SIZE),
        fontWeight: 700,
        fontFamily: FONT_FAMILY,
        lineHeight: 28,
        opacity: 0.9,
        scaleX: 0.8,
        align: 'right',
        shadowColor: 'rgba(0, 0, 0, 0.45)',
        shadowBlur: 4,
        shadowOffsetX: 0,
        shadowOffsetY: 1
      }
    }
  }
};

export const DEFAULT_FORM_VALUES = {
  location: '\u5e7f\u4e1c\u7701\u5e7f\u5dde\u5e02\u767d\u4e91\u533a\u9f99\u4e95\u897f\u8def4\u53f7',
  weather: '\u6674',
  temperature: '26\u00b0C'
};
