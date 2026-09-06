import { PositionSection } from '@/types'

// Homepage skeleton layout - 20 fixed positions
export const HOMEPAGE_POSITIONS: PositionSection[] = [
  {
    position: 1,
    name: 'Breaking News',
    description: 'Top banner - Urgent/breaking news',
    style: 'breaking'
  },
  {
    position: 2,
    name: 'Hero Article',
    description: 'Main hero - Large headline, 2/3 width',
    style: 'hero-main'
  },
  {
    position: 3,
    name: 'Hero Image',
    description: 'Hero visual - Featured image, 1/3 width',
    style: 'hero-image'
  },
  {
    position: 4,
    name: 'Top Story 1',
    description: 'Top stories section - Left card',
    style: 'card-large'
  },
  {
    position: 5,
    name: 'Top Story 2',
    description: 'Top stories section - Center card',
    style: 'card-large'
  },
  {
    position: 6,
    name: 'Top Story 3',
    description: 'Top stories section - Right card',
    style: 'card-large'
  },
  {
    position: 7,
    name: 'Featured 1',
    description: 'Featured section - Left column',
    style: 'card-medium'
  },
  {
    position: 8,
    name: 'Featured 2',
    description: 'Featured section - Right column',
    style: 'card-medium'
  },
  {
    position: 9,
    name: 'Latest News 1',
    description: 'Latest news - Left card',
    style: 'card-large'
  },
  {
    position: 10,
    name: 'Latest News 2',
    description: 'Latest news - Center card',
    style: 'card-large'
  },
  {
    position: 11,
    name: 'Latest News 3',
    description: 'Latest news - Right card',
    style: 'card-large'
  },
  {
    position: 12,
    name: 'Spotlight',
    description: 'Full-width spotlight - Special feature',
    style: 'spotlight'
  },
  {
    position: 13,
    name: "Editor's Pick 1",
    description: "Editor's picks - Card 1/4",
    style: 'card-small'
  },
  {
    position: 14,
    name: "Editor's Pick 2",
    description: "Editor's picks - Card 2/4",
    style: 'card-small'
  },
  {
    position: 15,
    name: "Editor's Pick 3",
    description: "Editor's picks - Card 3/4",
    style: 'card-small'
  },
  {
    position: 16,
    name: "Editor's Pick 4",
    description: "Editor's picks - Card 4/4",
    style: 'card-small'
  },
  {
    position: 17,
    name: 'Trending 1',
    description: 'Trending now - Left column',
    style: 'card-medium'
  },
  {
    position: 18,
    name: 'Trending 2',
    description: 'Trending now - Right column',
    style: 'card-medium'
  },
  {
    position: 19,
    name: 'More Stories 1',
    description: 'More stories - Left card',
    style: 'card-medium'
  },
  {
    position: 20,
    name: 'More Stories 2',
    description: 'More stories - Right card',
    style: 'card-medium'
  }
]

// Get position metadata by number
export function getPositionInfo(position: number): PositionSection | undefined {
  return HOMEPAGE_POSITIONS.find(p => p.position === position)
}

// Get position display name
export function getPositionName(position: number | null): string {
  if (position === null) return 'Not Assigned'
  if (position === 0) return 'Archived (Not on Homepage)'
  const info = getPositionInfo(position)
  return info ? `Position ${position}: ${info.name}` : `Position ${position}`
}

// Get style class for position badge
export function getPositionBadgeColor(position: number | null): string {
  if (position === null) return 'bg-neutral-200 text-neutral-600'
  if (position === 0) return 'bg-neutral-300 text-neutral-700'
  if (position === 1) return 'bg-red-100 text-red-800' // Breaking
  if (position === 2 || position === 3) return 'bg-blue-100 text-blue-800' // Hero
  if (position === 12) return 'bg-purple-100 text-purple-800' // Spotlight
  if (position >= 13 && position <= 16) return 'bg-green-100 text-green-800' // Editor's picks
  return 'bg-yellow-100 text-yellow-800' // Regular positions
}

// Get all available positions (not currently assigned)
export async function getAvailablePositions(): Promise<number[]> {
  const allPositions = Array.from({ length: 20 }, (_, i) => i + 1)
  // This will be filtered by actual DB query in the component
  return allPositions
}
