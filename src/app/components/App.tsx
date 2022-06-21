import '../styles/ui.css';
import React, {useRef, useState} from 'react';
import {Matrix} from '../modules/SwatchMatrix';
import {SwatchMapModel} from '../models/SwatchMapModel';
import {weightedTargets, Options} from '../constants/weightedTargets';

import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

declare function require(path: string): any;


const removeUndefinedWeightSwatches = (grid: Matrix.Grid) => {
    grid.columns.forEach(function (column, index) {
        let weightOptimizedSwatches = column.rows.filter((swatch) => {
            return swatch.weight !== undefined;
        });
        grid.columns[index].rows = weightOptimizedSwatches;
    });

    return grid;
};

const getClosestIndex = (swatch: Matrix.Swatch, targets: Array<any>) => {
    let m = swatch.l_target === 85 ? -2.5 : 0;
    var closest = targets.reduce(function (prev, curr) {
        return Math.abs(curr - (swatch.lightness + m)) < Math.abs(prev - (swatch.lightness + m)) ? curr : prev;
    });
    return targets.indexOf(closest);
};

const mapSwatchesToTarget = (grid: Matrix.Grid, mapper: SwatchMapModel) => {
    grid.columns.forEach(function (column) {
        let neutralTargets = column.rows[12].isNeutral;
        let targets = mapper.newTargets(neutralTargets);

        column.rows.forEach(function (row, index) {
            row.weight = undefined;
            if (targets.includes(row.l_target)) {
                row.weight = mapper.weights()[index];
            }
        });

        //
        // The userDefinedSwatch may not slot neatly into the L*5 matrix. If defined
        // swatch is not present, then insert into matrix, replacing for closest match.
        //
        column.rows.filter((swatch) => {
            if (swatch.isUserDefined === true && swatch.weight === undefined) {
                let index = getClosestIndex(swatch, targets);
                swatch.weight = column.rows[index].weight;
                column.rows[index].weight = undefined;
            }
        });
    });

    return grid;
};

const formatData = (data: any) => {
    let grid = JSON.parse(data) as Matrix.Grid;
    return grid;
};

const App = ({}) => {

    const inputFile = useRef(null);
    const [selection, setSelection] = useState<number>(0);

    const handleInputFile = (e: {target: any}) => {
        const fileReader = new FileReader();
        fileReader.readAsText(e.target.files[0], 'UTF-8');
        fileReader.onload = (e) => {
            let swatches = formatData(e.target.result);

            // let mapper = new SwatchMapModel(weightedTargets(0)) // non-optimized
            // let mapper = new SwatchMapModel(weightedTargets(6)) // Genome
            // let mapper = new SwatchMapModel(weightedTargets(7)); // NewsKit

            let mapper = new SwatchMapModel(weightedTargets(selection)) 
            let grid = removeUndefinedWeightSwatches(mapSwatchesToTarget(swatches, mapper));
            parent.postMessage({pluginMessage: {type: 'import-gcs', data: grid}}, '*');
        };
    };

    const onImport = () => {
        inputFile.current.click();
    };

    const onSelect = (event) => {
        console.log(event)
        let index = parseInt(event.value)
        setSelection(index)
    };

    const onCancel = () => {
        parent.postMessage({pluginMessage: {type: 'cancel'}}, '*');
    };

    React.useEffect(() => {
        // This is how we read messages sent from the plugin controller
        window.onmessage = (event) => {
            const {type, message} = event.data.pluginMessage;
            if (type === 'create-rectangles') {
                console.log(`Figma Says: ${message}`);
            }
        };
    }, []);

    return (
        <div>
            <img src={require('../assets/logo.svg')} />
            <h2>Genome Import</h2>

            <input
                ref={inputFile}
                onChange={handleInputFile}
                type="file"
                accept="application/JSON"
                style={{display: 'none'}}
            />
            <Dropdown options={Options} onChange={onSelect} value={selection.toString()} placeholder="Select an option" />;

            {/* <button onClick={onOpen}>DO STUFF</button> */}
            <button onClick={onCancel}>Cancel</button>
            <button id="create" onClick={onImport}>
                Import
            </button>
        </div>
    );
};

export default App;
