import { weightedTargetsColumn } from "../constants/weightedTargets";

export const antOptimization: weightedTargetsColumn = {
    rows: [
        {target: 0, weight: undefined},
        {target: 5, weight: undefined},
        {target: 10, weight: undefined},
        {target: 15, weight: undefined},
        {target: 20, weight: '10'},
        {target: 25, weight: '9'},
        {target: 30, weight: undefined},
        {target: 35, weight: '8'},
        {target: 40, weight: undefined},
        {target: 45, weight: '7'},
        {target: 50, weight: undefined},
        {target: 55, weight: undefined},
        {target: 60, weight: '6'},
        {target: 65, weight: '5'},
        {target: 70, weight: undefined},
        {target: 75, weight: '4'},
        {target: 80, weight: '3'},
        {target: 85, weight: undefined},
        {target: 90, weight: '2'},
        {target: 95, weight: '1'},
        {target: 97.5, weight: undefined},
        {target: 100, weight: undefined},
    ],
    neutrals: [],
};