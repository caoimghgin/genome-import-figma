
import { Matrix } from "../../genome/modules/SwatchMatrix";
import { emit } from "@create-figma-plugin/utilities";
import { SwatchesCreatedEvent } from "../../events/handlers";

const rootName = 'palette' as String;
const swatchWidth = 140;
const swatchHeight = 44;

//
// I want to flatten the Matix.Grid and pass a generic array
// rather than grid.columns or grid.columns.rows, the structure
// is implicit and works better.
//

export const createSwatches = async (grid: Matrix.Grid) => {
    loadFonts().then(() => {
        if (!paintStyleExists(grid)) {
            populateFigmaColorStyles(grid)
        } else {
            updateFigmaColorStyles(grid);
        }
        figma.closePlugin()
        // emit<SwatchesCreatedEvent>("SWATCHES_CREATED")
        // emit<ClosePluginEvent>("CLOSE_PLUGIN")

    })
}

function populateFigmaColorStyles(grid: Matrix.Grid) {
    const nodes: BaseNode[] = [];
    let offsetX = swatchWidth / 2;
    let offsetY = 0;
    grid.columns.forEach(function (column, colIndex, colArray) {
        nodes.push(createSemanticLabel(column, offsetX));
        column.rows.forEach(function (swatch, rowIndex) {
            if (colIndex === 0) {
                nodes.push(createWeightLabel(swatch, offsetY));
            }
            nodes.push(createSwatchFrame(swatch, createPaintStyle(swatch), offsetX, offsetY));
            if (colIndex + 1 === colArray.length) {
                nodes.push(createTargetLabel(grid.columns[0].rows[rowIndex], offsetX, offsetY));
            }
            offsetY = offsetY + swatchHeight;
        });
        offsetX = offsetX + swatchWidth;
        offsetY = 0;
    });

    // @ts-ignore
    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
}

const updateFigmaColorStyles = (grid: Matrix.Grid) => {
    grid.columns.forEach(function (column) {
        column.rows.forEach(function (swatch) {
            let name = createPaintStyleName(swatch);
            let paintStyle = getPaintStyleWithPathName(name)[0];
            updatePaintStyle(swatch, paintStyle);
            updateSwatchLabel(swatch);
        });
    });
}

function paintStyleExists(grid: Matrix.Grid) {
    let swatch = grid.columns[0].rows[0];
    let painStyleName = createPaintStyleName(swatch);
    return localPaintStyleNames().includes(painStyleName) ? true : false;
}

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
            ? [{type: 'SOLID', color: {r: 1, g: 1, b: 1}}]
            : [{type: 'SOLID', color: {r: 0, g: 0, b: 0}}];
    r.fontName =
        swatch.WCAG2_W_30 && !swatch.WCAG2_W_45
            ? {family: 'Inter', style: 'Bold'}
            : {family: 'Inter', style: 'Regular'};
    return r;
}

function getPaintStyleWithPathName(name: string) {
    return figma.getLocalPaintStyles().filter((obj) => {
        return obj.name === name;
    });
}

function updatePaintStyle(swatch: Matrix.Swatch, style: PaintStyle) {
    const result = style;
    result.description = createPaintStyleDescription(swatch);
    result.paints = [{type: 'SOLID', color: hexToRgb(swatch.hex)}];
    return result;
}

function createSemanticLabel(column: Matrix.Column, offsetX: number) {
    const result = figma.createText();
    result.name = ('semantic' + '-' + column.semantic) as string;
    result.characters = column.semantic as string;
    result.textAlignHorizontal = 'CENTER';
    result.textAlignVertical = 'CENTER';
    result.fontName = { family: 'Inter', style: 'Medium' };
    result.fontSize = 16;
    result.resize(swatchWidth, swatchHeight);
    result.x = offsetX;
    result.y = 0 - swatchHeight * 1.5;
    figma.currentPage.appendChild(result);
    return result;
}

function createWeightLabel(swatch: Matrix.Swatch, offsetY: number) {
    const result = figma.createText();
    result.name = 'weight' + '-' + swatch.weight!.toString();
    result.characters = swatch.weight!.toString();
    result.textAlignHorizontal = 'CENTER';
    result.textAlignVertical = 'CENTER';
    result.fontName = { family: 'Inter', style: 'Bold' };
    result.fontSize = 16;
    result.resize(swatchWidth / 2, swatchHeight);
    result.x = -16;
    result.y = offsetY;
    figma.currentPage.appendChild(result);
    return result;
}

function createSwatchFrame(swatch: Matrix.Swatch, style: PaintStyle, x: number, y: number) {
    const result = figma.createFrame();
    result.name = createFrameName(swatch);
    result.fillStyleId = style.id;
    result.layoutMode = 'HORIZONTAL';
    result.primaryAxisAlignItems = 'CENTER';
    result.counterAxisAlignItems = 'CENTER';
    result.resize(swatchWidth, swatchHeight);
    result.appendChild(createSwatchLabel(swatch));
    result.x = x;
    result.y = y;
    return result;
}

function createTargetLabel(swatch: Matrix.Swatch, offsetX: number, offsetY: number) {
    const result = figma.createText();
    result.name = 'target-' + swatch.l_target.toString();
    result.characters = 'L*' + swatch.l_target.toString();
    result.textAlignHorizontal = 'LEFT';
    result.textAlignVertical = 'CENTER';
    result.fontSize = 14;
    result.resize(swatchWidth / 2, swatchHeight);
    result.x = offsetX + swatchWidth + 24;
    result.y = offsetY;
    return result;
}

function createSwatchLabel(swatch: Matrix.Swatch) {
    const result = figma.createText();
    let label = swatch.hex.toUpperCase();
    if (swatch.isUserDefined) label = '⭐️ ' + label;
    if (swatch.isPinned) label = '📍 ' + label;
    result.characters = label;
    result.name = result.characters + ' (L*' + swatch.lightness + ')';
    result.fills =
        swatch.WCAG2_W_45 || swatch.WCAG2_W_30
            ? [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]
            : [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
    result.fontName =
        swatch.WCAG2_W_30 && !swatch.WCAG2_W_45
            ? { family: 'Inter', style: 'Bold' }
            : { family: 'Inter', style: 'Regular' };
    result.fontSize = 16;
    result.textAlignHorizontal = 'CENTER';
    result.textAlignVertical = 'CENTER';
    return result;
}

function createPaintStyle(swatch: Matrix.Swatch) {

    //
    // Maybe check to see if the painStyle exists before 
    // creating it. If exists, simply update and return.
    //

    const result = figma.createPaintStyle()
    result.name = createPaintStyleName(swatch)
    result.description = createPaintStyleDescription(swatch)
    result.paints = [{ type: 'SOLID', color: hexToRgb(swatch.hex) }]
    return result
}

function createPaintStyleName(swatch: Matrix.Swatch) {
    let result = [rootName];
    result.push(swatch.semantic);
    // result.push(swatch.semantic + swatch.weight!.toString());
    result.push(swatch.weight!.toString());
    return result.join('/');
}

function createPaintStyleDescription(swatch: Matrix.Swatch) {
    const result = [];
    result.push(`$${rootName}-${swatch.semantic}-${swatch.weight}` + "\n")
    // r.push('$' + rootName + '-' + swatch.semantic + '-' + swatch.weight + '\n');
    result.push('\n');
    result.push('hex: : ' + swatch.hex.toUpperCase() + '\n');
    result.push('L*: ' + swatch.lightness + ' (' + swatch.l_target + ')' + '\n');
    result.push('\n');
    result.push('#FFFFFF-4.5:1: ' + swatch.WCAG2_W_45 + '\n');
    result.push('#FFFFFF-3.0:1: ' + swatch.WCAG2_W_30 + '\n');
    result.push('#000000-4.5:1: ' + swatch.WCAG2_K_45 + '\n');
    result.push('#000000-3.0:1: ' + swatch.WCAG2_K_30 + '\n');
    return result.join('');
}

function hexToRgb(hex: string) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255,
        }
        : {
            r: parseInt("0", 16) / 255,
            g: parseInt("0", 16) / 255,
            b: parseInt("0", 16) / 255,
        }
}

function createFrameName(swatch: Matrix.Swatch) {
    return swatch.semantic + swatch.weight!.toString();
}

const loadFonts = async () => {
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
    await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
};

const localPaintStyleNames = () => {
    return figma.getLocalPaintStyles().map((style) => style.name);
}