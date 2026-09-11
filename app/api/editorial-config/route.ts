import { NextResponse } from 'next/server'
import { cloudGet, cloudPut, CLOUD_KEYS } from '@/lib/backend/cloudStore'

export const dynamic = 'force-dynamic'

const DEFAULT_CONFIG = {
  editorsNote: {
    quote: 'Our reporters in Frankfurt, Lagos and Seoul filed three stories this morning that, read together, describe the same machine from three angles.',
    author: 'Marta Reyes',
  },
  recommendedItems: [
    {
      name: 'The Atlantic',
      url: 'https://theatlantic.com',
      description: 'The Atlantic covers news, politics, culture, technology, health, and more.',
      badgeText: 'A',
      badgeBg: 'bg-[#d9222a] text-white',
    },
    {
      name: 'The New York Times',
      url: 'https://nytimes.com',
      description: 'Live news, investigations, opinion, photos and video from around the world.',
      badgeText: 'T',
      badgeBg: 'bg-black text-white dark:bg-white dark:text-black font-serif',
    },
  ],
}

async function readConfig() {
  try {
    const data = await cloudGet<any>(CLOUD_KEYS.EDITORIAL_CONFIG)
    if (data && typeof data === 'object') {
      return data
    }
  } catch (e) {
    console.error('Error reading editorial config from cloud:', e)
  }
  return DEFAULT_CONFIG
}

async function writeConfig(data: any) {
  try {
    return await cloudPut(CLOUD_KEYS.EDITORIAL_CONFIG, data)
  } catch (e) {
    console.error('Error writing editorial config to cloud:', e)
    return false
  }
}

export async function GET() {
  const config = await readConfig()
  return NextResponse.json(config)
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const current = await readConfig()

    const updated = {
      ...current,
      ...body,
      editorsNote: body.editorsNote ? { ...current.editorsNote, ...body.editorsNote } : current.editorsNote,
      recommendedItems: body.recommendedItems ? body.recommendedItems : current.recommendedItems,
    }

    const ok = await writeConfig(updated)
    if (!ok) {
      return NextResponse.json({ error: 'Failed to write config' }, { status: 500 })
    }

    return NextResponse.json(updated)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Invalid payload' }, { status: 400 })
  }
}
