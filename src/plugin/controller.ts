import x_data from "../app/assets/gcs-x.json"

const swatchWidth = 140
const swatchHeight = 44
const rootName = "palette"

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

        var data = JSON.parse(msg.data) as typeof x_data

        nodes.push.apply(nodes, drawWeights(data));
        nodes.push.apply(nodes, drawSemantics(data));

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

    if (msg.type === 'json') {

        await figma.loadFontAsync({ family: "Inter", style: "Regular" })
        await figma.loadFontAsync({ family: "Inter", style: "Bold" })

        const nodes = [];

        const styles = figma.getLocalPaintStyles();
        const styleNames = styles.map((style) => style.name);

        let offsetX = swatchWidth / 2
        let offsetY = 0

        nodes.push.apply(nodes, drawWeights(x_data));
        nodes.push.apply(nodes, drawSemantics(x_data));

        for (var col in x_data) {

            let semantic = x_data[col]["semantic"]

            let rows = x_data[col]["rows"]

            for (var row in rows) {

                let swatch = (x_data[col]["rows"][row])
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

function hexToRgb(hex: string) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
    } : null;
}