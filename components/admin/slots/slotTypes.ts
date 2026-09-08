export interface SlotDef {
  slot: number
  name: string
  location: string
  zone: 'Marquee & Lead' | 'Left Rail' | 'Center Hero' | 'Sub-Leads' | 'Ranked Wire' | "Editor's Picks"
  recommendedAspect: string
  description: string
  rank?: string
}

export const SLOTS: SlotDef[] = [
  {
    slot: 1,
    name: 'Breaking Dispatch Ticker',
    location: 'Top Marquee Bar',
    zone: 'Marquee & Lead',
    recommendedAspect: 'Text Headline Ticker',
    description: 'Top-of-fold animated breaking news marquee seen by 100% of front-page visitors.',
  },
  {
    slot: 2,
    name: 'Main Lead Hero Centerpiece',
    location: 'Center Column Top',
    zone: 'Center Hero',
    recommendedAspect: '16:10 Wide Hero',
    description: 'The dominant broadsheet centerpiece with highest headline hierarchy and wide imagery.',
  },
  {
    slot: 3,
    name: 'Left Rail Lead Card',
    location: 'Left Column Top',
    zone: 'Left Rail',
    recommendedAspect: '16:10 Card',
    description: 'Primary lead story on the left broadsheet rail.',
  },
  {
    slot: 4,
    name: 'Left Rail Sub-Card',
    location: 'Left Column Sub',
    zone: 'Left Rail',
    recommendedAspect: '16:10 Card',
    description: 'Secondary card on the left rail positioned directly above the editorial note.',
  },
  {
    slot: 5,
    name: 'Center Sub-Lead 1',
    location: 'Center Column Lower-Left',
    zone: 'Sub-Leads',
    recommendedAspect: '16:10 Card',
    description: 'First sub-lead story anchored beneath the main lead centerpiece.',
  },
  {
    slot: 6,
    name: 'Center Sub-Lead 2',
    location: 'Center Column Lower-Right',
    zone: 'Sub-Leads',
    recommendedAspect: '16:10 Card',
    description: 'Second sub-lead story anchored beneath the main lead centerpiece.',
  },
  {
    slot: 7,
    name: 'Ranked Wire Story 06',
    location: 'Right Column Top',
    zone: 'Ranked Wire',
    recommendedAspect: 'Text Headline Only',
    description: 'First ranked dispatch in the "More to Read" fast-scan wire.',
    rank: '06',
  },
  {
    slot: 8,
    name: 'Ranked Wire Story 07',
    location: 'Right Column',
    zone: 'Ranked Wire',
    recommendedAspect: 'Text Headline Only',
    description: 'Second ranked dispatch in the "More to Read" fast-scan wire.',
    rank: '07',
  },
  {
    slot: 9,
    name: 'Ranked Wire Story 08',
    location: 'Right Column',
    zone: 'Ranked Wire',
    recommendedAspect: 'Text Headline Only',
    description: 'Third ranked dispatch in the "More to Read" fast-scan wire.',
    rank: '08',
  },
  {
    slot: 10,
    name: 'Ranked Wire Story 09',
    location: 'Right Column',
    zone: 'Ranked Wire',
    recommendedAspect: 'Text Headline Only',
    description: 'Fourth ranked dispatch in the "More to Read" fast-scan wire.',
    rank: '09',
  },
  {
    slot: 11,
    name: 'Ranked Wire Story 10',
    location: 'Right Column Bottom',
    zone: 'Ranked Wire',
    recommendedAspect: 'Text Headline Only',
    description: 'Fifth ranked dispatch in the "More to Read" fast-scan wire.',
    rank: '10',
  },
  {
    slot: 12,
    name: "Editor's Pick 1",
    location: 'Carousel Card 1',
    zone: "Editor's Picks",
    recommendedAspect: '16:10 Card',
    description: "First feature card in the 4-story Editor's Picks curated quartet.",
  },
  {
    slot: 13,
    name: "Editor's Pick 2",
    location: 'Carousel Card 2',
    zone: "Editor's Picks",
    recommendedAspect: '16:10 Card',
    description: "Second feature card in the 4-story Editor's Picks curated quartet.",
  },
  {
    slot: 14,
    name: "Editor's Pick 3",
    location: 'Carousel Card 3',
    zone: "Editor's Picks",
    recommendedAspect: '16:10 Card',
    description: "Third feature card in the 4-story Editor's Picks curated quartet.",
  },
  {
    slot: 15,
    name: "Editor's Pick 4",
    location: 'Carousel Card 4',
    zone: "Editor's Picks",
    recommendedAspect: '16:10 Card',
    description: "Fourth feature card in the 4-story Editor's Picks curated quartet.",
  },
]

export type SlotSectionId = 'main' | 'left' | 'right' | 'editors'

export interface SlotSectionDef {
  id: SlotSectionId
  title: string
  subtitle: string
  slots: number[]
}

export const SLOT_SECTIONS: SlotSectionDef[] = [
  {
    id: 'main',
    title: 'Main Center & Lead',
    subtitle: 'Top breaking marquee, dominant lead hero centerpiece & sub-lead stories',
    slots: [1, 2, 5, 6],
  },
  {
    id: 'left',
    title: 'Left Side Rail',
    subtitle: 'Left broadsheet column primary lead card & secondary sub-card',
    slots: [3, 4],
  },
  {
    id: 'right',
    title: 'Right Side Main List',
    subtitle: 'Ranked Wire dispatches (Slots 06 through 10 fast-scan feed)',
    slots: [7, 8, 9, 10, 11],
  },
  {
    id: 'editors',
    title: "Editor's Choice",
    subtitle: "Curated quartet of editor's picks, investigations & cultural features",
    slots: [12, 13, 14, 15],
  },
]
