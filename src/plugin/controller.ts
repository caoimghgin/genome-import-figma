// import x_data from "../app/assets/gcs-x.json"
import { Matrix } from "../app/modules/SwatchMatrix";

const swatchWidth = 140
const swatchHeight = 44
const rootName = "palette" as String

figma.showUI(__html__);

figma.ui.onmessage = async (msg) => {

    if (msg.type === 'new-json') {

        const nodes = [];

        const styles = figma.getLocalPaintStyles();
        const styleNames = styles.map((style) => style.name);

        let offsetX = swatchWidth / 2
        let offsetY = 0

        await figma.loadFontAsync({ family: "Inter", style: "Regular" })
        await figma.loadFontAsync({ family: "Inter", style: "Bold" })

        let grid = msg.data as Matrix.Grid
        let data = msg.data as Matrix.Grid

        // nodes.push.apply(nodes, drawWeights(data));
        // nodes.push.apply(nodes, drawSemantics(data));

        grid.columns.forEach(function (column) {

            nodes.push(createSemanticLabel(column, offsetX))

            column.rows.forEach(function (swatch) {

                nodes.push(createWeightLabel(swatch, offsetY))
                // let style = createPaintStyle(swatch)
                nodes.push(createSwatchRectangle(swatch, createPaintStyle(swatch), offsetX, offsetY ))

                // const style = figma.createPaintStyle()
                // style.name = createPaintStyleName(swatch)
                // style.description = createPaintStyleDescription(swatch)
                // style.paints = [{ type: 'SOLID', color: hexToRgb(swatch.hex) }];

                // const rect = figma.createRectangle();
                // rect.name = createRectangleName(swatch)
                // rect.fillStyleId = style.id
                // rect.resize(swatchWidth, swatchHeight)
                // rect.y = offsetY;
                // rect.x = offsetX;

                nodes.push(createSwatchLabel(swatch, offsetX, offsetY))

                offsetY = offsetY + swatchHeight

            });

            offsetX = offsetX + swatchWidth
            offsetY = 0

        });

        figma.currentPage.selection = nodes;
        figma.viewport.scrollAndZoomIntoView(nodes);

        for (var col in data) {

            let semantic = data[col]["semantic"]

            let rows = data[col]["rows"]

            for (var row in rows) {
                let swatch = (data[col]["rows"][row])
                let hex = swatch.value
                let rgb = hexToRgb(hex)

                let description = []
                description.push("$" + rootName + "-" + semantic + "-" + row + "\n")
                description.push("\n")
                description.push("L*: " + swatch.lightness + " (" + swatch.l_target + ")" + "\n")
                description.push("id: " + swatch.id + "\n")
                description.push("\n")
                description.push("WCAG2 4.5:1 (W): " + swatch.WCAG2_W_45 + "\n")
                description.push("WCAG2 3.0:1 (W): " + swatch.WCAG2_W_30 + "\n")
                description.push("WCAG2 4.5:1 (K): " + swatch.WCAG2_K_45 + "\n")
                description.push("WCAG2 3.0:1 (K): " + swatch.WCAG2_K_30 + "\n")

                let styleName = [rootName]
                styleName.push(semantic)
                styleName.push(row)
                let paintStyleName = styleName.join("/")

                if (styleNames.includes(paintStyleName)) {

                    let res = styles.filter(style => style.name.includes(paintStyleName));
                    let style = res[0]
                    style.paints = [{ type: 'SOLID', color: rgb }];
                    style.description = description.join("")

                } else {

                    const style = figma.createPaintStyle()
                    style.name = paintStyleName
                    style.paints = [{ type: 'SOLID', color: rgb }];
                    style.description = description.join("")

                    const rect = figma.createRectangle();
                    rect.resize(swatchWidth, swatchHeight)
                    rect.y = offsetY;
                    rect.x = offsetX;

                    offsetY = offsetY + swatchHeight

                    rect.fillStyleId = style.id
                    rect.name = semantic + "-" + row

                    figma.currentPage.appendChild(rect);
                    nodes.push(rect);

                    const weightLabel = figma.createText()
                    weightLabel.textAlignHorizontal = "CENTER"
                    weightLabel.textAlignVertical = "CENTER"
                    weightLabel.fills = (swatch.WCAG2_W_45 ? [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }] : [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }]);

                    weightLabel.characters = (swatch.userDefined ? "⭐️ " : "") + hex
                    weightLabel.fontSize = 16

                    weightLabel.resize(swatchWidth, swatchHeight)
                    weightLabel.y = rect.y
                    weightLabel.x = rect.x
                    figma.currentPage.appendChild(weightLabel);
                    nodes.push(weightLabel);

                    figma.currentPage.selection = nodes;
                    figma.viewport.scrollAndZoomIntoView(nodes);


                }

            }

            offsetX = offsetX + swatchWidth
            offsetY = 0

        }

        figma.closePlugin();

    }


    figma.closePlugin();
};


function drawWeights(this_data) {

    const nodes = [];
    let offsetX = 0
    let offsetY = 0

    for (var col in this_data) {

        let rows = this_data[col]["rows"]

        for (var row in rows) {

            let swatch = (this_data[col]["rows"][row])
            let label = swatch.l_target.toString()

            const weightLabel = figma.createText()
            weightLabel.textAlignHorizontal = "CENTER"
            weightLabel.textAlignVertical = "CENTER"
            weightLabel.fontName = { family: "Inter", style: "Bold" }
            weightLabel.characters = label
            weightLabel.resize(swatchWidth / 2, swatchHeight)
            weightLabel.x = offsetX
            weightLabel.y = offsetY

            offsetY = offsetY + swatchHeight

            figma.currentPage.appendChild(weightLabel);
            nodes.push(weightLabel);

        }

        break
    }

    return nodes

}

function drawSemantics(this_data) {

    const nodes = [];
    let offsetX = swatchWidth / 2
    let offsetY = -(swatchHeight + 16)

    for (var col in this_data) {
        let semantic = this_data[col]["semantic"]

        const semanticLabel = figma.createText()
        semanticLabel.textAlignHorizontal = "CENTER"
        semanticLabel.textAlignVertical = "CENTER"
        semanticLabel.fontName = { family: "Inter", style: "Bold" }
        semanticLabel.fontSize = 16
        semanticLabel.resize(swatchWidth, swatchHeight)
        semanticLabel.characters = semantic
        semanticLabel.x = offsetX
        semanticLabel.y = offsetY

        figma.currentPage.appendChild(semanticLabel);
        nodes.push(semanticLabel);

        offsetX = offsetX + swatchWidth

    }

    return nodes

}

function createPaintStyle(swatch: Matrix.Swatch) {
    const r = figma.createPaintStyle()
    r.name = createPaintStyleName(swatch)
    r.description = createPaintStyleDescription(swatch)
    r.paints = [{ type: 'SOLID', color: hexToRgb(swatch.hex) }];
    return r
}

function createSwatchLabel(swatch: Matrix.Swatch, x: number, y: number) {
    const r = figma.createText()
    r.characters = (swatch.isUserDefined ? "⭐️ " : "") + swatch.hex.toUpperCase()
    r.fills = (swatch.WCAG2_W_45 ? [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }] : [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }]);
    r.fontSize = 16
    r.textAlignHorizontal = "CENTER"
    r.textAlignVertical = "CENTER"
    r.resize(swatchWidth, swatchHeight)
    r.x = x
    r.y = y
    figma.currentPage.appendChild(r);
    return r

}

function createWeightLabel(swatch: Matrix.Swatch, offsetY: number) {
    const r = figma.createText()
    r.characters = swatch.weight.toString()
    r.textAlignHorizontal = "CENTER"
    r.textAlignVertical = "CENTER"
    r.fontName = { family: "Inter", style: "Bold" }
    r.fontSize = 16
    r.resize(swatchWidth, swatchHeight)
    r.x = -80
    r.y = offsetY

    figma.currentPage.appendChild(r);
    return r
}

function createSwatchRectangle(swatch: Matrix.Swatch, style: PaintStyle, x: number, y: number) {
    const r = figma.createRectangle();
    r.name = createRectangleName(swatch)
    r.fillStyleId = style.id
    r.resize(swatchWidth, swatchHeight)
    r.x = x;
    r.y = y;

    figma.currentPage.appendChild(r);
    return r

}

function createSemanticLabel(column: Matrix.Column, offsetX: number) {

    const r = figma.createText()
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

function createRectangleName(swatch: Matrix.Swatch) {
    return ("swatch-" + swatch.semantic + "-" + swatch.row).toLowerCase();
}

function createPaintStyleDescription(swatch: Matrix.Swatch) {
    let r = []
    r.push("$" + rootName + "-" + swatch.semantic + "-" + swatch.row + "\n")
    r.push("\n")
    r.push("L*: " + swatch.lightness + " (" + swatch.l_target + ")" + "\n")
    r.push("id: " + swatch.id + "\n")
    r.push("\n")
    r.push("WCAG2 4.5:1 (W): " + swatch.WCAG2_W_45 + "\n")
    r.push("WCAG2 3.0:1 (W): " + swatch.WCAG2_W_30 + "\n")
    r.push("WCAG2 4.5:1 (K): " + swatch.WCAG2_K_45 + "\n")
    r.push("WCAG2 3.0:1 (K): " + swatch.WCAG2_K_30 + "\n")
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