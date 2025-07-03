import {
  Sora,
  Atkinson_Hyperlegible as AtkinsonHyperlegible,
  Exo_2 as Exo2,
  Roboto_Slab as RobotoSlab,
  Source_Sans_3 as SourceSans,
  Prompt,
  Press_Start_2P as PressStart2P,
} from 'next/font/google'

export const primFont = AtkinsonHyperlegible({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-atkinson-hyperlegible',
})

export const secFont = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
})

export const terFont = Exo2({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-exo-2',
})

export const heroFont = RobotoSlab({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: 'normal',
})

export const sourceSans = SourceSans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-source-sans-3',
})

export const promptFont = Prompt({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-prompt',
})

export const pressStartFont = PressStart2P({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-press-start-2p',
})
