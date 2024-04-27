import { h } from 'preact'
import { Inline } from '@create-figma-plugin/ui'
import { Matrix } from '../genome/modules/SwatchMatrix'
import { Mapper } from '../genome/mapper'

export const RenderPreview = (swatches: Matrix.Grid, optimization: string) => {

    if (!swatches) return
    const grid = Mapper.optimizeSwatches(swatches, optimization)

    return (
        <div>
            <Inline>
                {grid.columns.map(col => {
                    return (
                        <div style={{ display: "block" }}>
                            {col.rows.map(row => {
                                const color = row.WCAG2_W_45 || row.WCAG2_W_30 ? '#FFF' : '#000'
                                let symbol = "-"
                                if (row.isUserDefined) symbol = "⭐️"
                                if (row.isPinned) symbol = "📍"
                                return <div style={{ backgroundColor: row.hex, color: color, height: 16, width: 42 }}>{symbol}</div>
                            })}
                        </div>
                    )
                })}
            </Inline>
        </div>
    )
    
}