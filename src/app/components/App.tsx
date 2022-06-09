// import * as React from 'react';
import React, { useRef } from "react";
import { Matrix } from "../modules/SwatchMatrix";
import { SwatchMapModel } from "../models/SwatchMapModel";
import { weightedTargets } from "../constants/weightedTargets";
// import { columns } from "../constants"

import '../styles/ui.css';

declare function require(path: string): any;

const App = ({ }) => {

    const inputFile = useRef(null)

    const createThingy = () => {
        
        let swatch1 = new Matrix.Swatch()
        swatch1.id = "1"
        swatch1.hex = "#laksdjf"

        let swatch2 = new Matrix.Swatch()
        swatch2.id = "2"

        swatch2.hex = "#44rre"

        let swatch3 = new Matrix.Swatch()
        swatch3.id = "3"
        swatch3.hex = "#uujj"

        let swatch4 = new Matrix.Swatch()
        swatch4.id = "4"
        swatch4.hex = "#qqq"

        let col1 = new Matrix.Column()
        col1.semantic = "primary"
        col1.rows = [swatch1, swatch2]

        let col2 = new Matrix.Column()
        col2.semantic = "secondary"
        col2.rows = [swatch3, swatch4]

        let g = new Matrix.Grid()
        g.columns = [col1, col2]



        const json = JSON.stringify(g)
        console.log(json)

        const obj = JSON.parse(json) as Matrix.Grid
        console.log(obj)

    }

    const newHandleInputFile = (e: { target: any; }) => {
        const fileReader = new FileReader();
        fileReader.readAsText(e.target.files[0], "UTF-8");
        fileReader.onload = (e) => {
            let data = e.target.result
            let grid = formatData(data)
            // console.log(grid.columns[1].rows[12])
            parent.postMessage({ pluginMessage: { type: 'new-json', data: grid } }, '*');
        };
    };

    const formatData = (data: any) => {
        let grid = JSON.parse(data) as Matrix.Grid
        return grid
    }

    const onOpen = () => {
        inputFile.current.click()
    };

    const onCreate = () => {
        parent.postMessage({ pluginMessage: { type: 'json' } }, '*');
    };

    const onCancel = () => {
        parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*');
    };

    React.useEffect(() => {
        // This is how we read messages sent from the plugin controller
        window.onmessage = (event) => {
            const { type, message } = event.data.pluginMessage;
            if (type === 'create-rectangles') {
                console.log(`Figma Says: ${message}`);
            }
        };
    }, []);

    return (
        <div>

            <img src={require('../assets/logo.svg')} />
            <h2>Genome Import</h2>

            <input ref={inputFile}
                onChange={newHandleInputFile}
                type="file"
                accept="application/JSON"
                style={{ display: "none" }} />

            <button onClick={onOpen}>DO STUFF</button>

            <button onClick={onCancel}>Cancel</button>

            <button id="create" onClick={onCreate}>Import</button>
            <button onClick={createThingy}>Create Thingy</button>

        </div>
    );
};

// const displaySwatches = (map: SwatchMapModel, data: string) => {
//     console.log(map, data)
//     // let swatchIds = mapSwatchesToTarget(swatches, mapper)
// }

// const mapSwatchesToTarget = (swatches: SwatchModel[], mapper: SwatchMapModel) => {

//     //
//     // Before I go through this, need to determine if the color is a neutral
//     // Need to get the right targets for neutrals (not assume all will be same targets)
//     //

//     let result = [] as any

//     for (let column = 0; column < columns.length; column++) {

//         let visibleSwatches = [] as any

//         var columnSwatches = swatches.filter(obj => {
//             return obj.column === columns[column];
//         });

//         if (columnSwatches.length === 0) { break }

//         // if target includes the SwatchModel.l_target, then make visible
//         let t_targets = mapper.newTargets(columnSwatches[12].isNeutral)

//         columnSwatches.forEach(function (swatch) {
//             visibleSwatches.push(t_targets.includes(swatch.l_target) ? swatch : undefined)
//         })

//         //
//         // Shoehorn in the userDefined swatch, closest match
//         //
//         let userDefinedSwatch = columnSwatches.filter(obj => {
//             return obj.isUserDefined === true;
//         });

//         let visibleSwatchesDefined = visibleSwatches.filter(function (x: SwatchModel) {
//             return x !== undefined;
//         })

//         let targetsOptimized = t_targets.filter(function (x: number) {
//             return x !== -1;
//         })

//         let index = getClosestIndex(userDefinedSwatch[0], targetsOptimized)
//         visibleSwatchesDefined[index] = userDefinedSwatch[0]

//         //
//         // Pull out the grid id of swatches. This will broadcast to all listening swatches
//         //
//         let swatchIds = visibleSwatchesDefined.map((a: { id: string; }) => a.id);
//         result.push(...swatchIds)

//     }
//     return result
// }

// const getClosestIndex = (color: SwatchModel, targets: Array<any>) => {
//     var closest = targets.reduce(function (prev, curr) {
//         return (Math.abs(curr - color.lightness) < Math.abs(prev - color.lightness) ? curr : prev);
//     });
//     return targets.indexOf(closest)
// }


export default App;
