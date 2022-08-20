import React, {useRef, useState} from 'react';
import Dropdown from 'react-dropdown';
import {SwatchMapModel} from '../models/SwatchMapModel';
import {weightedTargets, Options} from '../constants/weightedTargets';
import {Mapper} from '../mapper';
import 'react-dropdown/style.css';
import '../styles/ui.css';

const App = ({}) => {
    const inputFile = useRef(null);
    const [selection, setSelection] = useState<number>(0);

    const handleInputFile = (e: {target: any}) => {
        const fileReader = new FileReader();
        fileReader.readAsText(e.target.files[0], 'UTF-8');
        fileReader.onload = (e) => {
            let swatches = Mapper.formatData(e.target.result);
            let map = new SwatchMapModel(weightedTargets(selection));
            let grid = Mapper.removeUndefinedWeightSwatches(Mapper.mapSwatchesToTarget(swatches, map));
            parent.postMessage({pluginMessage: {type: 'import-gcs', data: grid}}, '*');
        };
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const onTest = () => {
        // inputFile.current.click();
        parent.postMessage({pluginMessage: {type: 'TEST'}}, '*');
    };

    const onImport = () => {
        inputFile.current.click();
    };

    const onSelect = (event) => {
        console.log(event);
        let index = parseInt(event.value);
        setSelection(index);
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
            <h4>Need a gcs.json file? Make one here...</h4>
            <a href="https://www.genomecolor.space/">Genome Color Tool</a>

            <input
                ref={inputFile}
                onChange={handleInputFile}
                type="file"
                accept="application/JSON"
                style={{display: 'none'}}
            />
            <Dropdown
                options={Options}
                onChange={onSelect}
                value={selection.toString()}
                placeholder="Select an option"
            />
            {/* <button onClick={onOpen}>DO STUFF</button> */}
            <button onClick={onCancel}>Cancel</button>
            <button id="create" onClick={onImport}>
                Import
            </button>
            {/* <button id="create" onClick={onTest}>
                FIND STYLES TEST
            </button> */}
        </div>
    );
};

export default App;
