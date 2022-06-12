import { Matrix } from "../app/modules/SwatchMatrix";

const swatchWidth = 140
const swatchHeight = 44
const rootName = "palette" as String
const localPaintStyles = figma.getLocalPaintStyles();
const styleNames = localPaintStyles.map((style) => style.name);

export const hasChildren = (node: BaseNode): node is BaseNode & ChildrenMixin => Boolean(node['children'])

const loadFonts = async () => {

    await figma.loadFontAsync({ family: "Inter", style: "Regular" })
    await figma.loadFontAsync({ family: "Inter", style: "Bold" })
  
    console.log("Awaiting the fonts.")
  
  }

figma.showUI(__html__);

figma.ui.onmessage = async (msg) => {

    loadFonts().then(() => {

        if (msg.type === 'new-json') {

            let grid = msg.data as Matrix.Grid
          
            if (!paintStyleExists(grid)) {
                populateFigmaColorStyles(grid)
            } else {
                updateFigmaColorStyles(grid)
            }
    
            figma.closePlugin();
    
        }

    });

};


function updateSwatchLabel(swatch: Matrix.Swatch) {

    let name = createFrameName(swatch)
    let frameNode = figma.currentPage.findOne(n => n.name === name) as FrameNode
    let r = frameNode.children[0] as TextNode
    r.characters = (swatch.isUserDefined ? "⭐️ " : "") + swatch.hex.toUpperCase()
    r.name = r.characters + " (L*" + swatch.lightness + ")"
    r.fills = (swatch.WCAG2_W_45 || swatch.WCAG2_W_30? [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }] : [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }]);
    r.fontName = (swatch.WCAG2_W_30 && !swatch.WCAG2_W_45) ? { family: "Inter", style: "Bold" } : { family: "Inter", style: "Regular" }
    return r

}

function updateFigmaColorStyles(grid: Matrix.Grid) {

    grid.columns.forEach(function (column) {
        column.rows.forEach(function (swatch) {
            let paintStyle = getPaintStyleByName(swatch)[0]
            updatePaintStyle(swatch, paintStyle)
            updateSwatchLabel(swatch)
        });
    });

}

function populateFigmaColorStyles(grid: Matrix.Grid) {

    const nodes = [];

    let offsetX = swatchWidth / 2
    let offsetY = 0

    grid.columns.forEach(function (column, colIdx, colArray) {

        console.log(colIdx)
        nodes.push(createSemanticLabel(column, offsetX))

        column.rows.forEach(function (swatch, rowIdx) {

            if (colIdx === 0) { nodes.push(createWeightLabel(swatch, offsetY)) }
            nodes.push(createSwatchFrame(swatch, createPaintStyle(swatch), offsetX, offsetY))
            if (colIdx+1 === colArray.length) {nodes.push(createTargetLabel(grid.columns[0].rows[rowIdx], offsetX, offsetY))}

            offsetY = offsetY + swatchHeight

        });

        offsetX = offsetX + swatchWidth
        offsetY = 0

    });

    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);

}

function getPaintStyleByName(swatch: Matrix.Swatch) {
    let n = createPaintStyleName(swatch) 
    var r = localPaintStyles.filter(obj => {
        return obj.name === n;
    });
    return r
}

function paintStyleExists(grid: Matrix.Grid) {
    let swatch = grid.columns[0].rows[0]
    let painStyleName = createPaintStyleName(swatch)
    return (styleNames.includes(painStyleName) ? true : false)
}

function updatePaintStyle(swatch: Matrix.Swatch, style: PaintStyle) {
    const r = style
    r.description = createPaintStyleDescription(swatch)
    r.paints = [{ type: 'SOLID', color: hexToRgb(swatch.hex) }];

    return r
}

function createPaintStyle(swatch: Matrix.Swatch) {
    const r = figma.createPaintStyle()
    r.name = createPaintStyleName(swatch)
    r.description = createPaintStyleDescription(swatch)
    r.paints = [{ type: 'SOLID', color: hexToRgb(swatch.hex) }];

    return r
}

function createWeightLabel(swatch: Matrix.Swatch, offsetY: number) {

    const r = figma.createText()
    r.name = "weight" + "-" + swatch.weight.toString()
    r.characters = swatch.weight.toString()
    r.textAlignHorizontal = "CENTER"
    r.textAlignVertical = "CENTER"
    r.fontName = { family: "Inter", style: "Bold" }
    r.fontSize = 16
    r.resize(swatchWidth/2, swatchHeight)
    r.x = -16
    r.y = offsetY

    figma.currentPage.appendChild(r);
    return r
}

function createTargetLabel(swatch: Matrix.Swatch, offsetX: number, offsetY: number) {

    const r = figma.createText()
    r.name = "target-" + swatch.l_target.toString()
    r.characters = "L*" + swatch.l_target.toString()
    r.textAlignHorizontal = "LEFT"
    r.textAlignVertical = "CENTER"
    r.fontSize = 14
    r.resize(swatchWidth/2, swatchHeight)
    r.x = offsetX + swatchWidth + 24
    r.y = offsetY

    // figma.currentPage.appendChild(r);
    return r
}

function createSwatchFrame(swatch: Matrix.Swatch, style: PaintStyle, x: number, y: number) {

    const r = figma.createFrame();
    r.name = createFrameName(swatch)
    r.fillStyleId = style.id
    r.layoutMode = "HORIZONTAL"
    r.primaryAxisAlignItems = "CENTER"
    r.counterAxisAlignItems = "CENTER"
    r.resize(swatchWidth, swatchHeight)
    r.appendChild(createSwatchLabel(swatch))
    r.x = x;
    r.y = y;

    return r
}

function createSwatchLabel(swatch: Matrix.Swatch) {
    const r = figma.createText()
    r.characters = (swatch.isUserDefined ? "⭐️ " : "") + swatch.hex.toUpperCase()
    r.name = r.characters + " (L*" + swatch.lightness + ")"
    r.fills = (swatch.WCAG2_W_45 || swatch.WCAG2_W_30? [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }] : [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }]);
    r.fontName = (swatch.WCAG2_W_30 && !swatch.WCAG2_W_45) ? { family: "Inter", style: "Bold" } : { family: "Inter", style: "Regular" }
    r.fontSize = 16
    r.textAlignHorizontal = "CENTER"
    r.textAlignVertical = "CENTER"
    return r
}

function createSemanticLabel(column: Matrix.Column, offsetX: number) {

    const r = figma.createText()

    r.name = "semantic"  + "-" + column.semantic as string
    r.characters = column.semantic as string
    r.textAlignHorizontal = "CENTER"
    r.textAlignVertical = "CENTER"
    r.fontName = { family: "Inter", style: "Bold" }
    r.fontSize = 16
    r.resize(swatchWidth, swatchHeight)
    r.x = offsetX
    r.y = 0 - (swatchHeight * 1.5)

    figma.currentPage.appendChild(r);
    return r

}

function createFrameName(swatch: Matrix.Swatch) {
    let name = createPaintStyleName(swatch).toLowerCase()
    return name.split("/").join("-");
}

function createPaintStyleDescription(swatch: Matrix.Swatch) {
    let r = []
    r.push("$" + rootName + "-" + swatch.semantic + "-" + swatch.weight + " (" + swatch.id  + ")" + "\n")
    r.push("\n")
    r.push("hex: : " + swatch.hex.toUpperCase() + "\n")
    r.push("L*: " + swatch.lightness + " (" + swatch.l_target + ")" + "\n")
    r.push("\n")
    r.push("#FFFFFF-4.5:1: " + swatch.WCAG2_W_45 + "\n")
    r.push("#FFFFFF-3.0:1: " + swatch.WCAG2_W_30 + "\n")
    r.push("#000000-4.5:1: " + swatch.WCAG2_K_45 + "\n")
    r.push("#000000-3.0:1: " + swatch.WCAG2_K_30 + "\n")
    return r.join("")
}

function createPaintStyleName(swatch: Matrix.Swatch) {
    let n = [rootName]
    n.push(swatch.semantic)
    n.push(swatch.weight.toString())
    return n.join("/")
}

function hexToRgb(hex: string) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
    } : null;
}