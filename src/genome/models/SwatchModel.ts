export class SwatchModel {
    id!: string
    column!: string
    row!: number
    name!: string
    hex!: string
    original?: SwatchModel
    weight!: string
    semantic!: string
    lightness!: number
    isUserDefined!: boolean
    isNeutral!: boolean
    l_target!: number
    WCAG2!: number
    WCAG3!: number
    WCAG2_W_30!: boolean
    WCAG2_W_45!: boolean
    WCAG2_K_30!: boolean
    WCAG2_K_45!: boolean
}