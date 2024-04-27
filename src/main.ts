// @ts-nocheck

import { once, showUI } from '@create-figma-plugin/utilities'
import { CreateSwatchesEvent, ClosePluginEvent } from './types'
import { Matrix } from './genome/modules/SwatchMatrix';
import { zeroPad } from './genome/constants';

const rootName = 'palette' as String;
const swatchWidth = 140;
const swatchHeight = 44;
const localPaintStyles = figma.getLocalPaintStyles();
const styleNames = localPaintStyles.map((style) => style.name);

export default function () {

  showUI({ height: 610, width: 500 })

  once<CreateSwatchesEvent>('CREATE_SWATCHES', async function (grid: Matrix.Grid, optimization: string) {
    await loadFonts()
    if (!paintStyleExists(grid)) {
      createPaintStyles(grid, optimization);
      drawPaintSwatches(grid, optimization)
      createPaintStyleEffects()
    } else {
      updateFigmaColorStyles(grid);
    }
    figma.closePlugin()
  })

  once<ClosePluginEvent>('CLOSE_PLUGIN', function () {
    figma.closePlugin()
  })

}

const createPaintStyles = async (grid: Matrix.Grid, optimization: string) => {
  appendBlackWhiteSwatches(grid, optimization)
  grid.columns.map(column => {
    column.rows.map(swatch => {
      createPaintStyle(swatch)
    })
  })
  removeBlackWhiteSwatches(grid, optimization)
}

const drawPaintSwatches = (grid: Matrix.Grid, optimization: string) => {

  const nodes = [];

  let offsetX = swatchWidth / 2;
  let offsetY = 0;

  grid.columns.forEach(function (column, colIdx, colArray) {

    nodes.push(createSemanticLabel(column, offsetX));

    column.rows.forEach(function (swatch, rowIdx) {

      if (colIdx === 0) nodes.push(createWeightLabel(swatch, offsetY));

      const name = createPaintStyleName(swatch);
      const paintStyle = getPaintStyleWithPathName(name)[0];
      nodes.push(createSwatchFrame(swatch, paintStyle, offsetX, offsetY));

      if (colIdx + 1 === colArray.length) {
        nodes.push(createTargetLabel(grid.columns[0].rows[rowIdx], offsetX, offsetY));
      }

      offsetY = offsetY + swatchHeight;

    });

    offsetX = offsetX + swatchWidth;
    offsetY = 0;

  });

  if (optimization === "Univers") nodes.push(...drawUniversToneScale())
  createFrameForNodes(nodes)

}

const drawUniversToneScale = () => {
  const result = []
  result.push(createVector([{ windingRule: "EVENODD", data: "M -32 0 L -32 86 L -24 86" }]))
  result.push(createVector([{ windingRule: "EVENODD", data: "M -24 90 L -32 90 L -32 350 L -24 350" }]))
  result.push(createVector([{ windingRule: "EVENODD", data: "M -24 354 L -32 354 L -32 570 L -24 570" }]))
  result.push(createVector([{ windingRule: "EVENODD", data: "M -24 574 L -32 574 L -32 790 L -24 790" }]))
  result.push(createVector([{ windingRule: "EVENODD", data: "M -24 794 L -32 794 L -32 880" }]))
  result.push(createToneLabel("Highlights", { x: -58, y: 86, width: 86, height: 17 }))
  result.push(createToneLabel("1/4 Tones", { x: -58, y: 350, width: 260, height: 17 }))
  result.push(createToneLabel("Midtones", { x: -58, y: 570, width: 216, height: 17 }))
  result.push(createToneLabel("3/4 Tones", { x: -58, y: 790, width: 216, height: 17 }))
  result.push(createToneLabel("Shadows", { x: -58, y: 880, width: 86, height: 17 }))
  result.push(createWhiteBlackLabel("000", { x: -49, y: -31, width: 34, height: 19 }))
  result.push(createWhiteBlackLabel("999", { x: -48, y: 893, width: 32, height: 19 }))
  return result
}

const removeBlackWhiteSwatches = (grid, optimization) => {
  if (optimization === "Univers") {
    grid.columns[grid.columns.length - 1].rows.shift()
    grid.columns[grid.columns.length - 1].rows.pop()
  }
}

const appendBlackWhiteSwatches = (grid, optimization) => {

  if (optimization === "Univers") {

    const white = new Matrix.Swatch()
    white.semantic = "neutral"
    white.id = "BOB"
    white.hex = "#FFFFFF"
    white.weight = "000"
    grid.columns[grid.columns.length - 1].rows.unshift(white)

    const black = new Matrix.Swatch()
    black.semantic = "neutral"
    black.id = "BOB"
    black.hex = "#000000"
    black.weight = "999"
    grid.columns[grid.columns.length - 1].rows.push(black)

  }

}

const loadFonts = async () => {
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
};

function updateSwatchLabel(swatch: Matrix.Swatch) {
  let name = createFrameName(swatch);
  let frameNode = figma.currentPage.findOne((n) => n.name === name) as FrameNode;
  let r = frameNode.children[0] as TextNode;

  let label = swatch.hex.toUpperCase();
  if (swatch.isUserDefined) label = '⭐️ ' + label;
  if (swatch.isPinned) label = '📍 ' + label;
  r.characters = label;

  r.name = r.characters + ' (L*' + swatch.lightness + ')';
  r.fills =
    swatch.WCAG2_W_45 || swatch.WCAG2_W_30
      ? [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]
      : [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
  r.fontName =
    swatch.WCAG2_W_30 && !swatch.WCAG2_W_45
      ? { family: 'Inter', style: 'Bold' }
      : { family: 'Inter', style: 'Regular' };
  return r;
}

function updateFigmaColorStyles(grid: Matrix.Grid) {
  grid.columns.forEach(function (column) {
    column.rows.forEach(function (swatch) {
      let name = createPaintStyleName(swatch);
      let paintStyle = getPaintStyleWithPathName(name)[0];
      updatePaintStyle(swatch, paintStyle);
      updateSwatchLabel(swatch);
    });
  });
}

function populateFigmaColorStyles(grid: Matrix.Grid, optimization: string) {

  const nodes = [];

  let offsetX = swatchWidth / 2;
  let offsetY = 0;

  grid.columns.forEach(function (column, colIdx, colArray) {

    nodes.push(createSemanticLabel(column, offsetX));

    column.rows.forEach(function (swatch, rowIdx) {

      if (colIdx === 0) nodes.push(createWeightLabel(swatch, offsetY));

      const paintStyle = createPaintStyle(swatch)
      // Let's see if there is a 000 or a 999. If so, don't draw it!

      if (swatch.weight !== "000" && swatch.weight !== "999") {
        nodes.push(createSwatchFrame(swatch, paintStyle, offsetX, offsetY));
      }

      if (colIdx + 1 === colArray.length) {
        nodes.push(createTargetLabel(grid.columns[0].rows[rowIdx], offsetX, offsetY));
      }

      if (swatch.weight !== "000" && swatch.weight !== "999") offsetY = offsetY + swatchHeight;

    });

    offsetX = offsetX + swatchWidth;
    offsetY = 0;
  });

  if (optimization === "Univers") {
    nodes.push(createVector([{ windingRule: "EVENODD", data: "M -32 0 L -32 86 L -24 86" }]))
    nodes.push(createVector([{ windingRule: "EVENODD", data: "M -24 90 L -32 90 L -32 350 L -24 350" }]))
    nodes.push(createVector([{ windingRule: "EVENODD", data: "M -24 354 L -32 354 L -32 570 L -24 570" }]))
    nodes.push(createVector([{ windingRule: "EVENODD", data: "M -24 574 L -32 574 L -32 790 L -24 790" }]))
    nodes.push(createVector([{ windingRule: "EVENODD", data: "M -24 794 L -32 794 L -32 880" }]))
    nodes.push(createToneLabel("Highlights", { x: -58, y: 86, width: 86, height: 17 }))
    nodes.push(createToneLabel("1/4 Tones", { x: -58, y: 350, width: 260, height: 17 }))
    nodes.push(createToneLabel("Midtones", { x: -58, y: 570, width: 216, height: 17 }))
    nodes.push(createToneLabel("3/4 Tones", { x: -58, y: 790, width: 216, height: 17 }))
    nodes.push(createToneLabel("Shadows", { x: -58, y: 880, width: 86, height: 17 }))
    nodes.push(createWhiteBlackLabel("000", { x: -49, y: -31, width: 34, height: 19 }))
    nodes.push(createWhiteBlackLabel("999", { x: -48, y: 893, width: 32, height: 19 }))
  }

  createFrameForNodes(nodes)

}

const createToneLabel = (label: string, coords: any) => {
  const r = figma.createText();
  r.characters = label
  r.textAlignHorizontal = 'CENTER';
  r.textAlignVertical = 'CENTER';
  r.fontSize = 14;
  r.resize(coords.width, coords.height)
  r.rotation = 90
  r.x = coords.x
  r.y = coords.y
  return r;
}

const createWhiteBlackLabel = (label: string, coords: any) => {
  const r = figma.createText();
  r.characters = label
  r.textAlignHorizontal = 'CENTER';
  r.textAlignVertical = 'CENTER';
  r.fontName = { family: 'Inter', style: 'Bold' };
  r.fontSize = 16;
  r.resize(coords.width, coords.height)
  r.x = coords.x
  r.y = coords.y
  return r;
}

const createVector = (data) => {
  const result = figma.createVector()
  result.vectorPaths = data
  return result
}

const createFrameForNodes = (nodes) => {

  const frameMarginTop = 24
  const frameMarginBottom = 48
  const frameMarginLeft = 24
  const frameMarginRight = 0

  const x = nodes.sort((a, b) => a.x - b.x)
  const x1 = x[0]
  const x2 = x[x.length - 1]

  const y = nodes.sort((a, b) => a.y - b.y)
  const y1 = y[0]
  const y2 = y[y.length - 1]

  const frameX = x1.x
  const frameY = y1.y
  const frameWidth = (x1.x * -1) + (x2.x + x2.width)
  const frameHeight = (y1.y * -1) + (y2.y + y2.height)

  const frame = figma.createFrame();
  frame.name = "palette"
  frame.x = frameX - frameMarginLeft
  frame.y = frameY - frameMarginTop
  frame.resize(frameWidth + frameMarginLeft + frameMarginRight, frameHeight + frameMarginTop + frameMarginBottom);
  figma.group(nodes, frame)
  figma.viewport.scrollAndZoomIntoView(nodes);

}

function getPaintStyleWithPathName(name: string) {
  return figma.getLocalPaintStyles().filter((obj) => {
    return obj.name === name;
  });
}

function paintStylesFiltered(paintStyles: PaintStyles[], keyword: string, filter?: SearchFilter.FullPath) {
  switch (filter) {
    case SearchFilter.FullPath:
      return paintStyles.filter((obj) => {
        return obj.name === keyword;
      });

    case SearchFilter.PathContains:
      return paintStyles.filter((obj) => {
        return obj.name.includes(keyword);
      });

    case SearchFilter.ItemName:
      return paintStyles.filter((obj) => {
        const path = obj.name.split('/');
        if (path[path.length - 1] === keyword) {
          return obj;
        }
      });

    case SearchFilter.RootDirectory:
      return paintStyles.filter((obj) => {
        const path = obj.name.split('/');
        if (path[0] === keyword) {
          return obj;
        }
      });

    case SearchFilter.ItemDirectory:
      return paintStyles.filter((obj) => {
        const path = obj.name.split('/');
        if (path.length > 1) {
          if (path[path.length - 2] === keyword) {
            return obj;
          }
        }
      });

    case SearchFilter.AnyDirectoryEquals:
      return paintStyles.filter((obj) => {
        const path = obj.name.split('/');
        if (path.includes(keyword)) {
          return obj;
        }
      });

    default:
      return paintStyles.filter((obj) => {
        return obj.name === keyword;
      });
  }
}

function getPaintStyleWithNameIncluding(name: string) {
  return figma.getLocalPaintStyles().filter((obj) => {
    return obj.name.includes(name);
  });
}

function paintStyleExists(grid: Matrix.Grid) {
  let swatch = grid.columns[0].rows[0];
  let painStyleName = createPaintStyleName(swatch);
  return styleNames.includes(painStyleName) ? true : false;
}

function updatePaintStyle(swatch: Matrix.Swatch, style: PaintStyle) {
  const result = style;
  result.paints = [{ type: 'SOLID', color: hexToRgb(swatch.hex) }];
  return result;
}

async function createPaintStyle(swatch: Matrix.Swatch) {
  const result = figma.createPaintStyle();
  result.name = createPaintStyleName(swatch);
  result.paints = [{ type: 'SOLID', color: hexToRgb(swatch.hex) }];
  return result;
}

function createPaintStylesBW() {
  const k = figma.createPaintStyle();
  k.name = rootName + '/' + 'neutral' + '/' + 'b&w' + '/' + 'black';
  k.paints = [{ type: 'SOLID', color: hexToRgb('#000000') }];

  const w = figma.createPaintStyle();
  w.name = rootName + '/' + 'neutral' + '/' + 'b&w' + '/' + 'white';
  w.paints = [{ type: 'SOLID', color: hexToRgb('#FFFFFF') }];
}

function createPaintStyleEffects() {

  let alphas = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95];

  alphas.forEach((alpha) => {
    const a = figma.createPaintStyle();
    a.name = rootName + '/' + 'alpha' + '/' + 'darken' + '/' + 'darken' + zeroPad(alpha, 0);
    a.paints = [{ type: 'SOLID', opacity: alpha / 100, color: hexToRgb('#000000') }];
    a.description = 'darken (' + alpha + '% opacity)';
  });

  alphas.forEach((alpha) => {
    const a = figma.createPaintStyle();
    a.name = rootName + '/' + 'alpha' + '/' + 'lighten' + '/' + 'white' + zeroPad(alpha, 0);
    a.paints = [{ type: 'SOLID', opacity: alpha / 100, color: hexToRgb('#FFFFFF') }];
    a.description = 'lighten (' + alpha + '% opacity)';
  });
}

function createWeightLabel(swatch: Matrix.Swatch, offsetY: number) {
  const r = figma.createText();
  r.name = 'weight' + '-' + swatch.weight.toString();
  r.characters = swatch.weight.toString();
  r.textAlignHorizontal = 'CENTER';
  r.textAlignVertical = 'CENTER';
  r.fontName = { family: 'Inter', style: 'Bold' };
  r.fontSize = 16;
  r.resize(swatchWidth / 2, swatchHeight);
  r.x = -16;
  r.y = offsetY;
  figma.currentPage.appendChild(r);
  return r;
}

function createTargetLabel(swatch: Matrix.Swatch, offsetX: number, offsetY: number) {
  const r = figma.createText();
  r.name = 'target-' + swatch.l_target.toString();
  r.characters = 'L*' + swatch.l_target.toString();
  r.textAlignHorizontal = 'LEFT';
  r.textAlignVertical = 'CENTER';
  r.fontSize = 14;
  r.resize(swatchWidth / 2, swatchHeight);
  r.x = offsetX + swatchWidth + 24;
  r.y = offsetY;
  return r;
}

function createSwatchFrame(swatch: Matrix.Swatch, style: PaintStyle, x: number, y: number) {
  const r = figma.createFrame();
  r.name = createFrameName(swatch);
  r.fillStyleId = style.id;
  r.layoutMode = 'HORIZONTAL';
  r.primaryAxisAlignItems = 'CENTER';
  r.counterAxisAlignItems = 'CENTER';
  r.resize(swatchWidth, swatchHeight);
  r.appendChild(createSwatchLabel(swatch));
  r.x = x;
  r.y = y;
  return r;
}

function createSwatchLabel(swatch: Matrix.Swatch) {
  const r = figma.createText();
  let label = swatch.hex.toUpperCase();
  if (swatch.isUserDefined) label = '⭐️ ' + label;
  if (swatch.isPinned) label = '📍 ' + label;
  r.characters = label;
  r.name = r.characters + ' (L*' + swatch.lightness + ')';
  r.fills =
    swatch.WCAG2_W_45 || swatch.WCAG2_W_30
      ? [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]
      : [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
  r.fontName =
    swatch.WCAG2_W_30 && !swatch.WCAG2_W_45
      ? { family: 'Inter', style: 'Bold' }
      : { family: 'Inter', style: 'Regular' };
  r.fontSize = 16;
  r.textAlignHorizontal = 'CENTER';
  r.textAlignVertical = 'CENTER';
  return r;
}

function createSemanticLabel(column: Matrix.Column, offsetX: number) {
  const r = figma.createText();
  r.name = ('semantic' + '-' + column.semantic) as string;
  r.characters = column.semantic as string;
  r.textAlignHorizontal = 'CENTER';
  r.textAlignVertical = 'CENTER';
  r.fontName = { family: 'Inter', style: 'Bold' };
  r.fontSize = 16;
  r.resize(swatchWidth, swatchHeight);
  r.x = offsetX;
  r.y = 0 - swatchHeight * 1.5;
  figma.currentPage.appendChild(r);
  return r;
}

function createFrameName(swatch: Matrix.Swatch) {
  return swatch.semantic + swatch.weight.toString();
}

function createPaintStyleDescription(swatch: Matrix.Swatch) {
  if (swatch.semantic && swatch.semantic && swatch.weight && swatch.id && swatch.lightness) {
    let r = [];
    r.push('$' + rootName + '-' + swatch.semantic + '-' + swatch.weight + ' (' + swatch.id + ')' + '\n');
    r.push('\n');
    r.push('hex: : ' + swatch.hex.toUpperCase() + '\n');
    r.push('L*: ' + swatch.lightness + ' (' + swatch.l_target + ')' + '\n');
    r.push('\n');
    r.push('#FFFFFF-4.5:1: ' + swatch.WCAG2_W_45 + '\n');
    r.push('#FFFFFF-3.0:1: ' + swatch.WCAG2_W_30 + '\n');
    r.push('#000000-4.5:1: ' + swatch.WCAG2_K_45 + '\n');
    r.push('#000000-3.0:1: ' + swatch.WCAG2_K_30 + '\n');
    return r.join('');
  }
  return ""
}

function createPaintStyleName(swatch: Matrix.Swatch) {
  let n = [rootName];
  n.push(swatch.semantic);
  n.push(swatch.semantic + swatch.weight.toString());
  return n.join('/');
}

function figmaPaintToRGB(paint): any {
  let color = paint['color'];
  return {
    r: Math.round(color.r * 255),
    g: Math.round(color.g * 255),
    b: Math.round(color.b * 255),
    a: Math.round(paint.opacity * 100) / 100,
  };
}

function rgbToHex(rgb) {
  return '#' + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);
}

function hexToRgb(hex: string) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255,
    }
    : null;
}