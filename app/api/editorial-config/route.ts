import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const configPath = path.join(process.cwd(), 'data', 'editorialConfig.json')

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

function readConfig() {
  try {
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, 'utf-8')
      return JSON.parse(raw)
    }
  } catch (e) {
    console.error('Error reading editorialConfig.json:', e)
  }
  return DEFAULT_CONFIG
}

function writeConfig(data: any) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (e) {
    console.error('Error writing editorialConfig.json:', e)
    return false
  }
}

export async function GET() {
  const config = readConfig()
  return NextResponse.json(config)
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const current = readConfig()

    const updated = {
      ...current,
      ...body,
      editorsNote: body.editorsNote ? { ...current.editorsNote, ...body.editorsNote } : current.editorsNote,
      recommendedItems: body.recommendedItems ? body.recommendedItems : current.recommendedItems,
    }

    const ok = writeConfig(updated)
    if (!ok) {
      return NextResponse.json({ error: 'Failed to write config' }, { status: 500 })
    }

    return NextResponse.json(updated)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Invalid payload' }, { status: 400 })
  }
}
