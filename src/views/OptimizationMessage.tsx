import { h } from 'preact'
import { Inline, Text, Container, VerticalSpace, Link } from '@create-figma-plugin/ui'
import { Matrix } from '../genome/modules/SwatchMatrix'
import { Mapper } from '../genome/mapper'
import { Options } from '../genome/constants/weightedTargets'

export const OptimizationMessage = (optimization: string) => {

    const opt = Options.find(item => item.label === optimization)?.value
    const index = opt ? parseInt(opt) : 0

    switch (index) {
        case WeightedTargetsOptions.Base:
            return (
                <div>
                    <VerticalSpace space="large" />
                    <Text align="left">The <b>Base Optimization</b> divided into L*5 steps. All optimizations are derived from these values.</Text>
                </div>
            )
        case WeightedTargetsOptions.Genome:
            return (
                <div>
                    <VerticalSpace space="large" />
                    <Text align="left">The <b>Genome Optimization</b> is a meaningfully weighted, semantically named Color System designed for prototypical white-label and dark-mode support. The numeric weights are inspired by typography where 400 is normal.</Text>
                    <VerticalSpace space="large" />
                    <Text align="left">The base weight is <b>400</b> (L*45) and passes for 4.5:1 ratio on weights <b>000</b>, <b>015</b>, <b>025</b>. Weight <b>300</b> (L*50) passes 4.5:1 on <b>000</b> and <b>950</b>.</Text>
                    <VerticalSpace space="large" />
                    <Text align="left">Weight <b>200</b> passes for 3:1 ratio on weights <b>000</b>, <b>015</b>, <b>025</b> and weight <b>100</b> passes 3:1 on <b>000</b> only.</Text>
               </div>
            )
        case WeightedTargetsOptions.Carbon:
            return (
                <div>
                    <VerticalSpace space="large" />
                    <Text align="left">The <b>Carbon Optimization</b> base weight is <b>60</b> (L*45) which passes for 4.5:1 ratio on white and weight <b>10</b>. Weight <b>50</b> passes for 3:1 on white.</Text>
               </div>
            )
        case WeightedTargetsOptions.Lightning:
            return (
                <div>
                    <VerticalSpace space="large" />
                    <Text align="left">A Meaningfully Weighted, Definitively Named, and Packaged Color System, SalesForce Lightning is WCAG compliant with a wide variety of colors of tints/shades, but does not offer a Color Tool to create your own.</Text>
                    <VerticalSpace space="large" />
                    <Text align="left">Numeric weights directly adopt L* values from CIELAB, so lighter values have higher numbers and darker values are lower, which can be counter-intuitive to users.</Text>
                    <VerticalSpace space="large" />
                    <Text align="left">Learn more about SalesForce Lightning Color System at <Link href="https://www.lightningdesignsystem.com/guidelines/color/our-color-system/" target="_blank">www.lightningdesignsystem.com</Link></Text>
               </div>
            )

        case WeightedTargetsOptions.AdobeSpectrum:
            return (
                <div>
                    <VerticalSpace space="large" />
                    <Text align="left">The <b>Genome</b> optimization does things nothing else can. I'll tell you things about this optimization...</Text>
               </div>
            )
        case WeightedTargetsOptions.Ant:
            return (
                <div>
                    <VerticalSpace space="large" />
                    <Text align="left">The <b>Genome</b> optimization does things nothing else can. I'll tell you things about this optimization...</Text>
               </div>
            )
        case WeightedTargetsOptions.Material:
            return (
                <div>
                    <VerticalSpace space="large" />
                    <Text align="left">The <b>Genome</b> optimization does things nothing else can. I'll tell you things about this optimization...</Text>
               </div>
            )
        case WeightedTargetsOptions.AccessiblePalette:
            return (
                <div>
                    <VerticalSpace space="large" />
                    <Text align="left">The <b>Genome</b> optimization does things nothing else can. I'll tell you things about this optimization...</Text>
               </div>
            )
        case WeightedTargetsOptions.AccessiblePalette:
            return (
                <div>
                    <VerticalSpace space="large" />
                    <Text align="left">The <b>Genome</b> optimization does things nothing else can. I'll tell you things about this optimization...</Text>
               </div>
            )
        case WeightedTargetsOptions.ColorBox:
            return (
                <div>
                    <VerticalSpace space="large" />
                    <Text align="left">The <b>Genome</b> optimization does things nothing else can. I'll tell you things about this optimization...</Text>
               </div>
            )
    }

}

// A Meaningfully Weighted, Semantically Named Color System designed for white-label and dark-mode support.

enum WeightedTargetsOptions {
    Base = 0,
    Genome,
    Carbon,
    Lightning,
    AdobeSpectrum,
    Ant,
    Material,
    AccessiblePalette,
    ColorBox,
}