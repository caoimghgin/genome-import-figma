import { SwatchModel } from "./SwatchModel"

export class ColumnModel {
    id: String;
    semantic: String;
    rows: SwatchModel[];
}

// "A": {
//     "values": {
//         "0": {
//             "id": "A0",
//             "value": "#ffffff",
//             "lightness": 100,
//             "l_target": 100,
//             "userDefined": false,
//             "ccName": "WHITE-05"
//         },
        // "name": "primary"