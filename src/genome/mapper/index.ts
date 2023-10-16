import { Matrix } from '../modules/SwatchMatrix';
import { SwatchMapModel } from '../models/SwatchMapModel';
import { Options } from '../constants/weightedTargets';
import { WeightedTargets } from '../constants/weightedTargets';

export const removeUndefinedWeightSwatches = (grid: Matrix.Grid) => {
    const result = {...grid}
    result.columns.forEach(function (column, index) {
        let weightOptimizedSwatches = column.rows.filter((swatch) => {
            return swatch.weight !== undefined;
        });
        result.columns[index].rows = weightOptimizedSwatches;
    });

    return result;
};

export const mapSwatchesToTarget = (grid: Matrix.Grid, mapper: SwatchMapModel) => {

    const result = {...grid}

    result.columns.forEach(function (column) {
        let neutralTargets = column.rows[12].isNeutral;
        let targets = mapper.newTargets(neutralTargets);

        column.rows.forEach(function (row, index) {
            row.weight = undefined;
            if (targets.includes(row.l_target)) {
                row.weight = mapper.weights()[index];
            }
        });

        //
        // The pinned may not slot neatly into the L*5 matrix. If defined
        // swatch is not present, then insert into matrix, replacing for closest match.
        //
        column.rows.filter((swatch) => {
            if (swatch.isPinned === true && swatch.weight === undefined) {
                let index = getClosestIndex(swatch, targets);
                // need to test if a .isUserDefined is in the slot!
                let testing = column.rows[index];
                if (testing.isUserDefined == false) {
                    swatch.weight = column.rows[index].weight;
                    column.rows[index].weight = undefined;
                }
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

    return matrixGridCleaner(result);
};

export const optimizeSwatches = (grid: Matrix.Grid, optimizationValue: string) => {

    const result = {...grid}

    const optimization = Options.find(item => item.label === optimizationValue)?.value
    const index = optimization ? parseInt(optimization) : 0
    const mapModel = new SwatchMapModel(WeightedTargets(index))

    result.columns.forEach(function (column) {
        let neutralTargets = column.rows[12].isNeutral;
        let targets = mapModel.newTargets(neutralTargets);

        column.rows.forEach(function (row, index) {
            row.weight = undefined;
            if (targets.includes(row.l_target)) {
                row.weight = mapModel.weights()[index];
            }
        });

        //
        // The pinned may not slot neatly into the L*5 matrix. If defined
        // swatch is not present, then insert into matrix, replacing for closest match.
        //
        column.rows.filter((swatch) => {
            if (swatch.isPinned === true && swatch.weight === undefined) {
                let index = getClosestIndex(swatch, targets);
                // need to test if a .isUserDefined is in the slot!
                let testing = column.rows[index];
                if (testing.isUserDefined == false) {
                    swatch.weight = column.rows[index].weight;
                    column.rows[index].weight = undefined;
                }
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

    return matrixGridCleaner(result);
};

const matrixGridCleaner = (grid: Matrix.Grid) => {
    const result = grid.columns.map(col => {
        const rows = col.rows.map(row => row).filter(swatch => Boolean(swatch.weight))
        return { semantic: col.semantic, rows: rows}
    })
    return {columns: result}
}

export const getClosestIndex = (swatch: Matrix.Swatch, targets: Array<any>) => {
    
    let m = swatch.l_target === 85 ? -2.5 : 0;
    var closest = targets.reduce(function (prev, curr) {
        return Math.abs(curr - (swatch.lightness + m)) < Math.abs(prev - (swatch.lightness + m)) ? curr : prev;
    });
    return targets.indexOf(closest);
};

export const formatData = (data: any) => {
    return JSON.parse(data) as Matrix.Grid;
};

export * as Mapper from '.';
