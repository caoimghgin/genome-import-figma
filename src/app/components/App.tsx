import React, {useRef, useState} from 'react';
import Select from 'react-select';
import styled from '@emotion/styled';
import {SwatchMapModel} from '../models/SwatchMapModel';
import {weightedTargets, Options} from '../constants/weightedTargets';
import {Mapper} from '../mapper';
import '../styles/ui.css';
import {Matrix} from '../modules/SwatchMatrix';

const App = ({}) => {
    const inputRef = useRef(null);
    const [selection, setSelection] = useState<number>(0);
    const [importButtonTitle, setImportButtonTitle] = useState('Choose a gcs.json file...');
    const [optimization, setOptimization] = useState(Options[0]);
    const [swatches, setSwatches] = useState<Matrix.Grid>();
    const [isDisabled, setIsDisabled] = useState(true);

    // const input = document.getElementById('foo');

    // input?.addEventListener('change', event => {
    //   // 👇️ inline type assertion
    //   const result = (event.target as HTMLInputElement).files;
    //   console.log("I SEE", result);
    // });

    const handleInputRef = () => {
        // 👇️ open file input box on click of other element
        inputRef.current.click();
    };

    const onImport = () => {
        let map = new SwatchMapModel(weightedTargets(selection));
        let grid = Mapper.removeUndefinedWeightSwatches(Mapper.mapSwatchesToTarget(swatches, map));
        parent.postMessage({pluginMessage: {type: 'import-gcs', data: grid}}, '*');
    };

    const onSelect = (event) => {
        let index = parseInt(event.value);
        setOptimization(Options[index]);
        setSelection(index);
    };

    const handleInputFile = (e: {target: any}) => {
        const fileReader = new FileReader();
        fileReader.readAsText(e.target.files[0], 'UTF-8');

        const files = (event.target as HTMLInputElement).files;
        setImportButtonTitle(files[0].name);

        fileReader.onload = (e) => {
            setSwatches(Mapper.formatData(e.target.result));
            setIsDisabled(false);
        };
    };

    //     var reader = new FileReader();
    // reader.fileName = file.name // file came from a input file element. file = el.files[0];
    // reader.onload = function(readerEvt) {
    //     console.log(readerEvt.target.fileName);
    // };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const onTest = () => {
        parent.postMessage({pluginMessage: {type: 'TEST'}}, '*');
    };

    const onCancel = () => {
        parent.postMessage({pluginMessage: {type: 'cancel'}}, '*');
    };

    const openGenome = () => {
        window.open('https://www.genomecolor.space/');
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

    //
    //
    const Container = styled.div`
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        min-height: 100%;
        /* background: #E9F2FA; */
        /* width: 300px; */
        /* border: 1px solid #E2E2E2; */
    `;

    const Body = styled.div`
        padding: 16px;
        font-size: 16px;
        text-align: left;
    `;

    const Instructions = styled.ol`
        margin-top: 32px;
        padding: 8px;
        background: #e9f2fa;
        border-radius: 8px;
        list-style: inside;
    `;

    const InstructionItem = styled.li`
        margin: 16px 0px;
        padding-left: 16px;
    `;

    const Footer = styled.div`
        display: flex;
        height: 32px;
        align-items: center;
        border-top: 1px solid #d4d4d4;
        justify-content: space-between;
        margin-top: auto;
        padding: 16px 0px 0px 0px;
    `;

    const CancelImportContainer = styled.div`
        display: inline-flex;
        flex-wrap: wrap;
    `;

    const SelectFileButton = styled.button`
        display: flex;
        height: 38px;
        width: 100%;
        align-items: center;
        justify-content: space-between;
        margin: 0px 0px 16px 0px;
        background: #ffffff !important;
        border: 1px solid #cccccc !important;
        border-radius: 4px;
        font-size: 16px;
        color: #333333 !important;
    `;

    return (
        <Container>
            <input
                id="foo"
                style={{display: 'none'}}
                ref={inputRef}
                onChange={handleInputFile}
                type="file"
                accept="application/JSON"
            />

            <Body>
                <SelectFileButton onClick={handleInputRef}> {importButtonTitle} </SelectFileButton>
                <Select value={optimization} onChange={onSelect} options={Options} />
                <Instructions>
                    <InstructionItem>
                        <b>Create your palette </b> in Genome.{' '}
                    </InstructionItem>
                    <InstructionItem>
                        <b>Download the palette </b> to your local.{' '}
                    </InstructionItem>
                    <InstructionItem>
                        <b>Choose the 'gcs.json' palette </b> you created.{' '}
                    </InstructionItem>
                    <InstructionItem>
                        <b>Select an optimization</b> from the menu.{' '}
                    </InstructionItem>
                    <InstructionItem>
                        <b>Import</b> to create/update Figma color styles.
                    </InstructionItem>
                </Instructions>
            </Body>

            <Footer>
                <button onClick={openGenome}>Open Genome</button>
                <CancelImportContainer>
                    <button onClick={onCancel}>Cancel</button>
                    <button id="button-primary" onClick={onImport} disabled={isDisabled}>
                        {' '}
                        Import{' '}
                    </button>
                </CancelImportContainer>
            </Footer>
        </Container>
    );

    // return (
    //     <div>
    //         <h4>Need a gcs.json file? Make one here...</h4>
    //         <a href="https://www.genomecolor.space/">Genome Color Tool</a>

    // <input
    //     ref={inputFile}
    //     onChange={handleInputFile}
    //     type="file"
    //     accept="application/JSON"
    //     style={{display: 'none'}}
    // />
    //         <Dropdown
    //             options={Options}
    //             onChange={onSelect}
    //             value={selection.toString()}
    //             placeholder="Select an option"
    //         />
    //         {/* <button onClick={onOpen}>DO STUFF</button> */}
    //         <button onClick={onCancel}>Cancel</button>
    //         <button id="create" onClick={onImport}>
    //             Import
    //         </button>
    //         {/* <button id="create" onClick={onTest}>
    //             FIND STYLES TEST
    //         </button> */}
    //     </div>
    // );
};

export default App;
