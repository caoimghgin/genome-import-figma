import { weightedTargetsColumn } from "../constants/weightedTargets";

export const spectrumOptimization: weightedTargetsColumn = {
    rows: [
        {target: 0, weight: undefined},
        {target: 5, weight: undefined},
        {target: 10, weight: undefined},
        {target: 15, weight: '1300'},
        {target: 20, weight: undefined},
        {target: 25, weight: '1200'},
        {target: 30, weight: '1100'},
        {target: 35, weight: '1000'},
        {target: 40, weight: undefined},
        {target: 45, weight: '900'},
        {target: 50, weight: '800'},
        {target: 55, weight: undefined},
        {target: 60, weight: '700'},
        {target: 65, weight: '600'},
        {target: 70, weight: undefined},
        {target: 75, weight: '500'},
        {target: 80, weight: '400'},
        {target: 85, weight: '300'},
        {target: 90, weight: '200'},
        {target: 95, weight: '100'},
        {target: 97.5, weight: undefined},
        {target: 100, weight: undefined},
    ],
    neutrals: [],
};