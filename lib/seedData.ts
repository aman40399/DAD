import { Article } from '@/types'

const now = new Date().toISOString()
const d = (hoursAgo: number) => new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString()

export const SEED_ARTICLES: Article[] = [
  {
    id: 'n-0001-2026-09-06',
    title: 'Putin Holds "Substantive" Talks With U.S. Envoys as Ukraine Signals Willingness to Pause Strikes on Moscow',
    slug: 'putin-talks-us-envoys-ukraine-pause-strikes',
    subtitle: 'President Zelensky announces readiness to halt airstrikes through Monday following back-channel dialogue with American intermediaries.',
    excerpt: 'Russian and American officials engaged in what the Kremlin described as frank and substantive discussions, while Ukraine signalled a temporary halt to strikes on the Russian capital.',
    content: `
      <p class="lead">Russian President Vladimir Putin hosted U.S. envoys Steve Witkoff and Jared Kushner in Moscow on Friday for what the Kremlin described as "substantive and frank" discussions about the war in Ukraine — the most senior-level diplomatic engagement between Washington and Moscow in months.</p>
      <p>The talks, held inside the Kremlin's ornate Ekaterina Hall, lasted approximately three hours and covered a range of issues including potential ceasefire frameworks, humanitarian corridors, and energy security arrangements in the Black Sea region.</p>
      <p>Separately, Ukrainian President Volodymyr Zelensky announced late Friday that Ukraine is prepared to refrain from airstrikes against Moscow through Monday, contingent on reciprocal restraint from Russian forces along the southern front.</p>
      <blockquote>"We are not offering surrender — we are offering silence. If silence can buy even forty-eight hours of breathing room for diplomacy, then every hour of restraint is worth the risk." — President Volodymyr Zelensky</blockquote>
      <p>Despite cautious optimism among Western diplomats, senior officials in Washington stressed that no formal breakthrough had been achieved and that significant gaps remain between Russian and Ukrainian negotiating positions on territorial sovereignty and security guarantees.</p>
      <p>Financial markets responded with measured optimism: European natural gas futures fell 4.2 percent, and the Ukrainian hryvnia strengthened against the dollar for the first time in six weeks.</p>
    `.trim(),
    author: 'Dhananjay Singh',
    category: 'World',
    image_url: 'https://images.unsplash.com/photo-1548345680-f5475ea5df84?w=1200&h=750&fit=crop',
    image_caption: 'The Kremlin complex seen from across the Moscow River during the high-level diplomatic session | Photo: Reuters / Moscow Bureau',
    video_url: null,
    featured: true,
    is_breaking: true,
    status: 'published',
    homepage_position: 1,
    tags: ['Russia', 'Ukraine', 'Diplomacy', 'United States'],
    language: 'english',
    created_at: d(2), updated_at: d(1), published_at: d(1),
    imageUrl: 'https://images.unsplash.com/photo-1548345680-f5475ea5df84?w=1200&h=750&fit=crop',
    homepagePosition: 1, createdAt: d(2), updatedAt: d(1), publishedAt: d(1),
  },
  {
    id: 'n-0002-2026-09-06',
    title: 'Mount Anak Krakatau Erupts, Forcing Closure of Jakarta\'s Main Airport and Disrupting Dozens of Flights',
    slug: 'mount-anak-krakatau-erupts-jakarta-airport-closed',
    subtitle: 'Indonesia raises volcanic alert to highest level as ash clouds force Soekarno-Hatta International Airport to divert all commercial traffic.',
    excerpt: 'A powerful eruption of Mount Anak Krakatau has shut down Jakarta\'s primary international airport, stranding thousands of passengers and disrupting regional air travel across Southeast Asia.',
    content: `
      <p class="lead">Mount Anak Krakatau, the volcanic island born from the catastrophic 1883 eruption of Krakatoa in Indonesia's Sunda Strait, erupted violently early Saturday morning, sending a towering column of ash and pyroclastic material more than 15 kilometres into the atmosphere.</p>
      <p>Soekarno-Hatta International Airport, Jakarta's main aviation hub serving over 60 million passengers annually, was forced to halt all departures and arrivals as volcanic ash contaminated airspace across western Java and southern Sumatra.</p>
      <p>Indonesia's Centre for Volcanology and Geological Hazard Mitigation elevated the alert level for the volcano to Level IV — the highest tier — and urged residents in coastal areas of Banten and Lampung provinces to remain at least five kilometres from the shoreline due to the risk of volcanic tsunamis.</p>
      <p>Garuda Indonesia, Lion Air, and several regional carriers cancelled a combined total of 87 scheduled flights. Airlines across Southeast Asia are rerouting long-haul services to avoid the ash cloud, which is drifting northwest toward the Indian Ocean.</p>
      <p>"We are deploying additional monitoring buoys in the Sunda Strait and coordinating with the Pacific Tsunami Warning Center to ensure rapid early warning capability," said Dr. Hendra Gunawan, head of the national geological agency.</p>
    `.trim(),
    author: 'Dhananjay Singh',
    category: 'World',
    image_url: 'https://images.unsplash.com/photo-1462332420958-a05d1e002413?w=1200&h=750&fit=crop',
    image_caption: 'Volcanic eruption sends ash plume into the atmosphere above the Sunda Strait, viewed from Anyer, Banten Province | Photo: BNPB Indonesia',
    video_url: null,
    featured: true,
    is_breaking: false,
    status: 'published',
    homepage_position: 2,
    tags: ['Indonesia', 'Volcano', 'Natural Disaster', 'Aviation'],
    language: 'english',
    created_at: d(4), updated_at: d(2), published_at: d(2),
    imageUrl: 'https://images.unsplash.com/photo-1462332420958-a05d1e002413?w=1200&h=750&fit=crop',
    homepagePosition: 2, createdAt: d(4), updatedAt: d(2), publishedAt: d(2),
  },
  {
    id: 'n-0003-2026-09-06',
    title: 'U.S. Navy Destroys Three Iranian Oil Tankers in Escalating Gulf Confrontation',
    slug: 'us-navy-destroys-iranian-oil-tankers-gulf',
    subtitle: 'Pentagon confirms strikes on vessels accused of funding sanctioned military operations; Tehran vows "tougher reprisals."',
    excerpt: 'The U.S. military confirmed the destruction of three Iranian oil tankers in the Persian Gulf, marking a significant escalation in the ongoing conflict between Washington and Tehran.',
    content: `
      <p class="lead">The United States military confirmed on Friday the destruction of three Iranian oil tankers operating in the Persian Gulf, in what the Pentagon described as a response to attempted missile attacks on American naval vessels earlier in the week.</p>
      <p>The strikes, carried out by guided-missile destroyers of the U.S. Fifth Fleet, targeted tankers that American intelligence officials said were part of a sanctions-evasion network used to fund Iran's Islamic Revolutionary Guard Corps and its regional proxy operations.</p>
      <p>Iran's Supreme National Security Council condemned the strikes as "acts of maritime piracy" and warned of "tougher reprisals," escalating rhetoric that has alarmed energy markets and prompted emergency consultations at NATO headquarters in Brussels.</p>
      <p>Brent crude futures surged 6.8 percent to $94.70 per barrel in Asian trading following the announcement, while Lloyd's of London raised its war-risk insurance premiums for vessels transiting the Strait of Hormuz by an additional 1.5 percentage points.</p>
      <p>The United Nations Security Council has called an emergency session for Monday to address the escalation, with European members pushing for a maritime de-escalation framework modeled on Cold War-era naval incidents agreements.</p>
    `.trim(),
    author: 'Dhananjay Singh',
    category: 'World',
    image_url: 'https://images.unsplash.com/photo-1580309237429-661ea0e18e62?w=1200&h=750&fit=crop',
    image_caption: 'U.S. Navy destroyer on patrol in the Persian Gulf during heightened security operations | Photo: U.S. Navy / Released',
    video_url: null,
    featured: false,
    is_breaking: false,
    status: 'published',
    homepage_position: 3,
    tags: ['Iran', 'United States', 'Military', 'Oil'],
    language: 'english',
    created_at: d(6), updated_at: d(3), published_at: d(3),
    imageUrl: 'https://images.unsplash.com/photo-1580309237429-661ea0e18e62?w=1200&h=750&fit=crop',
    homepagePosition: 3, createdAt: d(6), updatedAt: d(3), publishedAt: d(3),
  },
  {
    id: 'n-0004-2026-09-06',
    title: 'South Korea Hits Record $709 Billion in Cumulative Exports, Surpassing Annual Best',
    slug: 'south-korea-record-exports-709-billion',
    subtitle: 'Semiconductor and electric vehicle battery shipments drive the Republic of Korea past its previous full-year export record with four months still remaining.',
    excerpt: 'South Korea achieved a historic milestone as cumulative exports for 2026 reached $709.4 billion, surpassing the previous annual record with the year barely three-quarters complete.',
    content: `
      <p class="lead">The Republic of Korea has shattered its own trade records, with cumulative merchandise exports reaching $709.4 billion as of September 5, 2026 — surpassing the previous full-year record set in 2022 with nearly four months of the fiscal year still remaining.</p>
      <p>The Korea Customs Service attributed the landmark achievement primarily to surging global demand for advanced semiconductors, high-capacity EV battery cells, and next-generation display panels, which together account for roughly 42 percent of the nation's total export revenue.</p>
      <p>Samsung Electronics and SK Hynix have been key contributors, with combined memory chip exports alone exceeding $148 billion year-to-date. Meanwhile, battery giants LG Energy Solution and Samsung SDI have expanded production to meet orders from European and North American automakers transitioning to electric platforms.</p>
      <p>"This milestone demonstrates that Korea's strategic investments in semiconductor manufacturing, battery technology, and advanced materials science are paying dividends at scale," said Trade Minister Ahn Duk-geun at a press briefing in Seoul.</p>
      <p>The Korean won strengthened 0.6 percent against the dollar following the announcement, and the benchmark KOSPI index rose 1.2 percent in morning trading.</p>
    `.trim(),
    author: 'Dhananjay Singh',
    category: 'Economy',
    image_url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&h=750&fit=crop',
    image_caption: 'Container vessels at Busan Port, South Korea\'s largest maritime trade hub handling over 22 million TEUs annually | Photo: Korea Maritime Institute',
    video_url: null,
    featured: false,
    is_breaking: false,
    status: 'published',
    homepage_position: 4,
    tags: ['South Korea', 'Economy', 'Trade', 'Semiconductors'],
    language: 'english',
    created_at: d(5), updated_at: d(3), published_at: d(3),
    imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&h=750&fit=crop',
    homepagePosition: 4, createdAt: d(5), updatedAt: d(3), publishedAt: d(3),
  },
  {
    id: 'n-0005-2026-09-06',
    title: 'Building Collapse in New Delhi Kills One, Dozens Feared Trapped Under Rubble',
    slug: 'building-collapse-new-delhi-dozens-trapped',
    subtitle: 'Rescue workers deploy heavy cranes and canine units as a four-storey residential structure collapses in the Bhajanpura locality of northeast Delhi.',
    excerpt: 'A four-storey residential building in New Delhi collapsed on Sunday morning, killing at least one person and leaving dozens of residents feared trapped beneath the debris.',
    content: `
      <p class="lead">A four-storey residential building in the densely populated Bhajanpura neighbourhood of northeast New Delhi collapsed early Sunday morning, killing at least one person and leaving an estimated 30 to 40 residents trapped beneath tonnes of concrete and steel debris.</p>
      <p>The National Disaster Response Force deployed four specialised urban search-and-rescue teams to the site within 45 minutes of the collapse, along with heavy hydraulic cranes, acoustic life detectors, and canine units trained to locate survivors beneath rubble.</p>
      <p>By midday, rescue teams had extracted 12 survivors, including three children, from the wreckage. At least eight of the rescued were transported to Lok Nayak Hospital with serious crush injuries. Emergency medical tents were erected at the perimeter as ambulance teams from five hospitals coordinated triage operations.</p>
      <p>Delhi Chief Minister Rekha Gupta visited the site and announced immediate ex-gratia compensation of ₹10 lakh for the family of the deceased and ₹2 lakh for each seriously injured survivor.</p>
      <p>Municipal records indicate that the building, constructed in 2003, had been flagged for structural deficiencies during a routine inspection in January 2025, but no evacuation or remediation orders were issued. The Delhi Development Authority has launched an investigation into the regulatory failure.</p>
    `.trim(),
    author: 'Dhananjay Singh',
    category: 'India',
    image_url: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=1200&h=750&fit=crop',
    image_caption: 'Emergency rescue operations at the collapse site in Bhajanpura, northeast Delhi | Photo: PTI / Delhi Fire Service',
    video_url: null,
    featured: false,
    is_breaking: false,
    status: 'published',
    homepage_position: 5,
    tags: ['India', 'Delhi', 'Disaster', 'Rescue'],
    language: 'english',
    created_at: d(3), updated_at: d(1), published_at: d(1),
    imageUrl: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=1200&h=750&fit=crop',
    homepagePosition: 5, createdAt: d(3), updatedAt: d(1), publishedAt: d(1),
  },
  {
    id: 'n-0006-2026-09-06',
    title: 'Wildfires Rage Across the United States With Over 118 New Blazes Reported Nationwide',
    slug: 'us-wildfires-118-new-fires-nationwide',
    subtitle: 'More than 16,500 firefighting personnel deployed as drought conditions and record heat fuel blazes from California to the Appalachian foothills.',
    excerpt: 'The United States is battling a devastating wildfire season with over 118 new fires reported across the country and more than 16,500 personnel committed to containment efforts.',
    content: `
      <p class="lead">The National Interagency Fire Center reported on Saturday that over 118 new wildfires have been documented across the United States in the past 72 hours, with more than 16,500 federal, state, and local firefighting personnel deployed to active containment operations in 14 states.</p>
      <p>California continues to bear the brunt of the fire season, with the Mendocino Complex blaze alone consuming over 42,000 acres of chaparral and timber. Governor Gavin Newsom declared a state of emergency for Mendocino and Lake counties and requested federal disaster assistance from the White House.</p>
      <p>In Oregon, the Bootleg Creek Fire has forced the evacuation of three rural communities and is threatening critical electrical transmission infrastructure that serves the Portland metropolitan area. PacifiCorp has preemptively de-energised segments of its high-voltage grid to reduce ignition risk.</p>
      <p>"We are operating in unprecedented conditions. Fuel moisture levels in many Western forests are at record lows for this time of year, and wind patterns are creating fire behaviour we haven't seen before," said NIFC Incident Commander Sarah Chen.</p>
      <p>The Biden administration announced the deployment of ten additional C-130 air tanker sorties and activated mutual aid agreements with Canadian and Australian firefighting agencies.</p>
    `.trim(),
    author: 'Dhananjay Singh',
    category: 'Environment',
    image_url: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1200&h=750&fit=crop',
    image_caption: 'Firefighters battle a wall of flame advancing through drought-parched forest in Northern California | Photo: CAL FIRE / Official Release',
    video_url: null,
    featured: false,
    is_breaking: false,
    status: 'published',
    homepage_position: 6,
    tags: ['Wildfire', 'Climate', 'United States', 'Emergency'],
    language: 'english',
    created_at: d(4), updated_at: d(2), published_at: d(2),
    imageUrl: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1200&h=750&fit=crop',
    homepagePosition: 6, createdAt: d(4), updatedAt: d(2), publishedAt: d(2),
  },
  {
    id: 'n-0007-2026-09-06',
    title: 'WHO Launches Global Mpox Vaccine Stockpile Initiative for Equitable Access',
    slug: 'who-launches-global-mpox-vaccine-stockpile',
    subtitle: 'International health agency coordinates with pharmaceutical partners to ensure rapid vaccine deployment during outbreaks in under-resourced regions.',
    excerpt: 'The World Health Organisation has launched a new global initiative to establish an emergency stockpile of mpox vaccines, aiming to eliminate disparities in outbreak response capacity between wealthy and developing nations.',
    content: `
      <p class="lead">The World Health Organisation announced on Friday the establishment of a global mpox vaccine stockpile, coordinated with international pharmaceutical partners and funded through a consortium of sovereign donors and multilateral development banks.</p>
      <p>The initiative aims to pre-position approximately 5 million doses of third-generation smallpox-derived vaccines at regional distribution hubs across sub-Saharan Africa, Southeast Asia, and Latin America — the regions most vulnerable to future mpox outbreaks.</p>
      <p>WHO Director-General Dr. Tedros Adhanom Ghebreyesus said the programme was designed to address the "vaccination equity gap" that was starkly exposed during the 2022-2024 mpox pandemic, when wealthy nations secured the vast majority of available doses while African countries with the highest caseloads waited months for deliveries.</p>
      <p>Bavarian Nordic, the Danish manufacturer of the Jynneos vaccine, has committed to producing 3 million doses at discounted pricing for the stockpile, with additional contributions expected from Japanese manufacturer KM Biologics.</p>
      <p>The Global Fund, GAVI, and the World Bank's Pandemic Fund have collectively pledged $280 million over three years to finance procurement, cold-chain infrastructure, and training for frontline health workers in recipient countries.</p>
    `.trim(),
    author: 'Dhananjay Singh',
    category: 'Health',
    image_url: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=1200&h=750&fit=crop',
    image_caption: 'Medical workers prepare vaccine doses at a WHO-coordinated distribution centre | Photo: WHO / Regional Africa Office',
    video_url: null,
    featured: false,
    is_breaking: false,
    status: 'published',
    homepage_position: 7,
    tags: ['WHO', 'Health', 'Vaccines', 'Mpox'],
    language: 'english',
    created_at: d(8), updated_at: d(4), published_at: d(4),
    imageUrl: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=1200&h=750&fit=crop',
    homepagePosition: 7, createdAt: d(8), updatedAt: d(4), publishedAt: d(4),
  },
  {
    id: 'n-0008-2026-09-06',
    title: 'Global Trade Hits New Highs but Least-Developed Countries Fall Further Behind in Digital Exports',
    slug: 'global-trade-highs-ldc-digital-gap-widens',
    subtitle: 'UNCTAD report finds services are reshaping world trade flows, but AI readiness and digital infrastructure remain starkly unequal.',
    excerpt: 'A new UNCTAD report reveals that while global trade in services is reaching record levels, the world\'s poorest nations are being left further behind in digital commerce and artificial intelligence preparedness.',
    content: `
      <p class="lead">The United Nations Conference on Trade and Development published its annual Global Trade Update on Friday, revealing that while international trade in services has reached record volumes, the gap between advanced economies and least-developed countries in digital exports and artificial intelligence readiness is widening at an alarming pace.</p>
      <p>Total global merchandise and services trade is on track to exceed $33 trillion in 2026, driven primarily by digitally-delivered services, cloud computing infrastructure, and cross-border data flows. However, the report found that the 46 nations classified as least-developed countries collectively account for less than 0.4 percent of global digitally-delivered services exports.</p>
      <p>"The digital divide is no longer just about internet access — it is about AI readiness, data governance capacity, and the ability to participate in increasingly automated global value chains," said UNCTAD Secretary-General Rebeca Grynspan.</p>
      <p>The report recommends targeted investments in digital infrastructure, regulatory harmonisation, and technology transfer mechanisms to prevent the emergence of a permanent "two-tier" global trading system.</p>
    `.trim(),
    author: 'Dhananjay Singh',
    category: 'Economy',
    image_url: 'https://images.unsplash.com/photo-1504711434969-e33886168d8c?w=1200&h=750&fit=crop',
    image_caption: 'Shipping containers at a major port terminal reflecting the scale of modern global trade | Photo: UNCTAD / Trade Statistics Division',
    video_url: null,
    featured: false,
    is_breaking: false,
    status: 'published',
    homepage_position: 8,
    tags: ['Trade', 'Economy', 'UNCTAD', 'Digital Divide'],
    language: 'english',
    created_at: d(10), updated_at: d(5), published_at: d(5),
    imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168d8c?w=1200&h=750&fit=crop',
    homepagePosition: 8, createdAt: d(10), updatedAt: d(5), publishedAt: d(5),
  },
  {
    id: 'n-0009-2026-09-06',
    title: 'Iran Threatens "Tougher Reprisals" After Claiming Strikes on U.S.-Linked Bases in Kuwait and UAE',
    slug: 'iran-threatens-reprisals-claims-strikes-kuwait-uae',
    subtitle: 'Tehran says missiles and drones struck American military facilities in the Gulf; Pentagon denies operational damage to any U.S. installation.',
    excerpt: 'Iran has threatened tougher reprisals and claimed to have struck U.S.-associated military facilities in Kuwait and the UAE, further escalating tensions in the Persian Gulf region.',
    content: `
      <p class="lead">Iran's Islamic Revolutionary Guard Corps has claimed responsibility for missile and drone strikes on military installations associated with American forces in Kuwait and the United Arab Emirates, marking a dramatic escalation in the Gulf confrontation that has rattled global energy markets and strained regional alliances.</p>
      <p>The Pentagon issued a statement denying any "operational damage to U.S. military installations" and said that American air defence systems intercepted the majority of incoming projectiles. However, Kuwaiti authorities confirmed minor structural damage at Ali Al Salem Air Base and ordered a temporary suspension of civilian flight operations from Kuwait International Airport as a precautionary measure.</p>
      <p>Iran's Supreme Leader Ayatollah Ali Khamenei, in a nationally televised address, warned that Tehran possesses "strategic patience but also strategic capability" and that any further strikes on Iranian assets would be met with "responses that America's regional architecture cannot absorb."</p>
      <p>The European Union's foreign policy chief called an emergency ministerial meeting for Tuesday to discuss a coordinated diplomatic response, while China's Ministry of Foreign Affairs urged "maximum restraint from all parties" and offered to host mediation talks in Beijing.</p>
      <p>Global oil prices spiked above $95 per barrel in overnight trading, while safe-haven assets including gold and the Swiss franc saw sharp inflows.</p>
    `.trim(),
    author: 'Dhananjay Singh',
    category: 'World',
    image_url: 'https://images.unsplash.com/photo-1597200381847-30ec200eeb9a?w=1200&h=750&fit=crop',
    image_caption: 'Military radar installation monitoring airspace over the Persian Gulf region | Photo: AFP / Gulf Security Bureau',
    video_url: null,
    featured: false,
    is_breaking: false,
    status: 'published',
    homepage_position: 9,
    tags: ['Iran', 'Middle East', 'Military', 'Gulf'],
    language: 'english',
    created_at: d(7), updated_at: d(3), published_at: d(3),
    imageUrl: 'https://images.unsplash.com/photo-1597200381847-30ec200eeb9a?w=1200&h=750&fit=crop',
    homepagePosition: 9, createdAt: d(7), updatedAt: d(3), publishedAt: d(3),
  },
  {
    id: 'n-0010-2026-09-06',
    title: 'Serbia\'s Ruling Party Nominates President Vučić as Lead Candidate for Snap Parliamentary Election',
    slug: 'serbia-vucic-nominated-parliamentary-election',
    subtitle: 'The Serbian Progressive Party backs Aleksandar Vučić to lead its ticket in an election widely seen as a referendum on his decade of political dominance.',
    excerpt: 'The Serbian Progressive Party has formally nominated President Aleksandar Vučić as its lead candidate for the upcoming snap parliamentary election, consolidating his grip on the country\'s political landscape.',
    content: `
      <p class="lead">The ruling Serbian Progressive Party officially nominated President Aleksandar Vučić as its lead candidate for snap parliamentary elections expected to take place in late October, a move that cements his position as the dominant force in Serbian politics for over a decade.</p>
      <p>The nomination was approved by acclamation at a party congress in Belgrade's Sava Center attended by over 15,000 delegates, with Vučić delivering a two-hour keynote address that combined economic optimism with sharp criticism of the European Union's enlargement timetable for the Western Balkans.</p>
      <p>Opposition parties, which have struggled to present a unified front against Vučić's political machine, accused the president of calling snap elections specifically to capitalise on a temporary uptick in approval ratings following recent infrastructure investments and a favourable IMF review of Serbia's fiscal position.</p>
      <p>"This is not a democratic exercise — it is a coronation," said opposition leader Marinika Tepić. "The president controls the media landscape, the electoral commission, and most municipal governments. These are elections in form but not in substance."</p>
      <p>The European Parliament's rapporteur for Serbia urged free and fair electoral conditions and warned that further democratic backsliding could jeopardise Serbia's EU accession timeline.</p>
    `.trim(),
    author: 'Dhananjay Singh',
    category: 'World',
    image_url: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&h=750&fit=crop',
    image_caption: 'Belgrade\'s National Assembly building, seat of the Serbian Parliament | Photo: AP / Belgrade Correspondent',
    video_url: null,
    featured: false,
    is_breaking: false,
    status: 'published',
    homepage_position: 10,
    tags: ['Serbia', 'Elections', 'Europe', 'Politics'],
    language: 'english',
    created_at: d(9), updated_at: d(5), published_at: d(5),
    imageUrl: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&h=750&fit=crop',
    homepagePosition: 10, createdAt: d(9), updatedAt: d(5), publishedAt: d(5),
  },
  {
    id: 'n-0011-2026-09-06',
    title: 'Gaza Ceasefire Violations Continue as Localised Efforts Underway to Restore Power Infrastructure',
    slug: 'gaza-ceasefire-violations-power-restoration',
    subtitle: 'Three Palestinians injured by Israeli army fire amid fragile truce; engineers work to repair critical electrical grid connections.',
    excerpt: 'Tensions in Gaza persist with ongoing ceasefire violations and three Palestinians injured by Israeli military fire, even as local engineers race to repair damaged electrical infrastructure.',
    content: `
      <p class="lead">The fragile ceasefire in Gaza continued to fray on Saturday as the Palestinian Health Ministry reported that three civilians were injured by Israeli army fire in the northern part of the territory, while international observers documented at least seven separate incidents of gunfire along the buffer zone.</p>
      <p>Despite the escalatory incidents, localised efforts to restore critical infrastructure showed signs of cautious progress. A team of Palestinian electrical engineers, working under coordination with UNRWA and the International Committee of the Red Cross, successfully reconnected a 22-kilovolt feeder line serving the Jabalia refugee camp — restoring intermittent power to approximately 35,000 residents for the first time in four months.</p>
      <p>UNICEF reported that the restoration of even limited electrical capacity has allowed the reopening of two water desalination plants, which are critical to preventing the spread of waterborne diseases in the overcrowded enclave.</p>
      <p>The UN Special Coordinator for the Middle East Peace Process urged both sides to recommit to the ceasefire framework and warned that continued violations risk a full resumption of hostilities that would push humanitarian conditions "past the point of recovery."</p>
    `.trim(),
    author: 'Dhananjay Singh',
    category: 'World',
    image_url: 'https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=1200&h=750&fit=crop',
    image_caption: 'Humanitarian aid workers coordinate relief operations in a conflict zone | Photo: ICRC / Field Documentation Unit',
    video_url: null,
    featured: false,
    is_breaking: false,
    status: 'published',
    homepage_position: 11,
    tags: ['Gaza', 'Palestine', 'Ceasefire', 'Humanitarian'],
    language: 'english',
    created_at: d(5), updated_at: d(2), published_at: d(2),
    imageUrl: 'https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=1200&h=750&fit=crop',
    homepagePosition: 11, createdAt: d(5), updatedAt: d(2), publishedAt: d(2),
  },
  {
    id: 'n-0012-2026-09-06',
    title: 'EU Lawmakers Finalise AI Act Enforcement Mechanism After Two Years of Debate',
    slug: 'eu-ai-act-enforcement-mechanism-finalised',
    subtitle: 'Member states align on audit procedures, compliance timelines, and penalty structures for the world\'s most comprehensive artificial intelligence regulation.',
    excerpt: 'Two years after the EU\'s landmark Artificial Intelligence Act took effect, European lawmakers have finally agreed on the enforcement mechanism that will govern audits, compliance deadlines, and fines.',
    content: `
      <p class="lead">European Union legislators have completed a two-year negotiation to finalise the enforcement mechanism for the Artificial Intelligence Act — the world's most comprehensive regulatory framework for AI systems — clearing the final bureaucratic hurdle for full implementation across all 27 member states.</p>
      <p>The agreed mechanism establishes a tiered audit system where AI systems classified as "high risk" — including those used in hiring, criminal justice, immigration processing, and critical infrastructure — must undergo independent conformity assessments every 18 months by accredited evaluation bodies.</p>
      <p>Companies found in violation of the Act's provisions face fines of up to 7 percent of global annual turnover or €35 million, whichever is greater. For prohibited AI practices, including real-time mass biometric surveillance and social scoring systems, penalties rise to 10 percent of global revenue.</p>
      <p>The regulation is expected to have significant extraterritorial impact, as any company offering AI services to European consumers — regardless of where it is headquartered — must comply with the Act's transparency, safety, and human oversight requirements.</p>
      <p>Tech industry groups have expressed concern about the compliance burden on smaller AI startups, while digital rights organisations have broadly welcomed the framework as a "global benchmark for accountable AI governance."</p>
    `.trim(),
    author: 'Dhananjay Singh',
    category: 'Technology',
    image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=750&fit=crop',
    image_caption: 'Artificial intelligence circuit visualization representing the regulatory frontier of AI governance | Photo: European Commission / Digital Policy Unit',
    video_url: null,
    featured: false,
    is_breaking: false,
    status: 'published',
    homepage_position: 12,
    tags: ['AI', 'EU', 'Regulation', 'Technology'],
    language: 'english',
    created_at: d(12), updated_at: d(6), published_at: d(6),
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=750&fit=crop',
    homepagePosition: 12, createdAt: d(12), updatedAt: d(6), publishedAt: d(6),
  },
  {
    id: 'n-0013-2026-09-06',
    title: 'Lebanon Military Operations Continue to Pose Civilian Risk Amid Fragile Political Transition',
    slug: 'lebanon-military-operations-civilian-risk',
    subtitle: 'UN peacekeepers document rising incidents along the Blue Line as parliamentary coalition negotiations stall in Beirut.',
    excerpt: 'Military activity in southern Lebanon continues to endanger civilians as the country navigates a fragile political transition and stalled coalition talks.',
    content: `
      <p class="lead">United Nations peacekeeping forces in Lebanon have documented a sustained increase in military activity along the Blue Line — the demarcation line separating Lebanon from Israel — with at least 14 incidents of exchanges of fire recorded over the past week, according to a confidential UNIFIL situation report obtained by The Meridiān.</p>
      <p>The report notes that three civilian homes in the village of Kfar Kila sustained damage from indirect fire, and that a UNIFIL patrol vehicle was struck by shrapnel, though no peacekeeping personnel were injured.</p>
      <p>In Beirut, efforts to form a new coalition government have stalled, with the three main parliamentary blocs unable to agree on the distribution of key cabinet portfolios, particularly the ministries of defence and finance.</p>
      <p>The humanitarian situation in southern Lebanon remains precarious, with the UN Office for the Coordination of Humanitarian Affairs estimating that approximately 120,000 residents have been displaced from border communities since tensions escalated in late 2025.</p>
      <p>France's special envoy for Lebanon is expected to arrive in Beirut on Wednesday to facilitate discussions between political factions and to push for a rapid formation of government as a precondition for unlocking international reconstruction aid.</p>
    `.trim(),
    author: 'Dhananjay Singh',
    category: 'World',
    image_url: 'https://images.unsplash.com/photo-1569077382689-5ebf9e367b78?w=1200&h=750&fit=crop',
    image_caption: 'View of the historic cityscape with Mediterranean coastline reflecting Lebanon\'s complex geopolitical position | Photo: UN / UNIFIL Documentation',
    video_url: null,
    featured: false,
    is_breaking: false,
    status: 'published',
    homepage_position: 13,
    tags: ['Lebanon', 'UNIFIL', 'Middle East', 'Conflict'],
    language: 'english',
    created_at: d(11), updated_at: d(5), published_at: d(5),
    imageUrl: 'https://images.unsplash.com/photo-1569077382689-5ebf9e367b78?w=1200&h=750&fit=crop',
    homepagePosition: 13, createdAt: d(11), updatedAt: d(5), publishedAt: d(5),
  },
  {
    id: 'n-0014-2026-09-06',
    title: 'Brent Crude Surges Past $95 as Gulf Tensions and Supply Disruptions Rattle Energy Markets',
    slug: 'brent-crude-surges-95-gulf-tensions',
    subtitle: 'Oil benchmarks hit 18-month highs as tanker strikes, Persian Gulf confrontation, and OPEC+ production discipline tighten the global supply outlook.',
    excerpt: 'Brent crude oil prices surged past $95 per barrel for the first time in 18 months as escalating military confrontation in the Persian Gulf combined with disciplined OPEC+ output cuts to tighten global energy supply.',
    content: `
      <p class="lead">Brent crude oil futures breached $95 per barrel in Asian trading on Saturday morning, reaching their highest level since March 2025, as a confluence of geopolitical tensions in the Persian Gulf, targeted disruptions to Iranian oil exports, and continued OPEC+ production discipline created what energy analysts are calling the "tightest supply outlook in two years."</p>
      <p>The immediate catalyst was the U.S. Navy's destruction of three Iranian oil tankers, which removed an estimated 2.1 million barrels of crude from transit. But analysts at Goldman Sachs noted that the price surge reflects deeper structural factors, including declining commercial crude inventories in OECD nations, which have fallen to their lowest seasonal levels since 2014.</p>
      <p>West Texas Intermediate crude, the U.S. benchmark, rose in tandem to $91.40 per barrel. U.S. gasoline futures for October delivery jumped 4.3 percent, suggesting that consumers may see price increases at the pump within days.</p>
      <p>OPEC+ members are scheduled to meet on September 15 to review production targets, and several delegates indicated that the alliance is unlikely to increase output despite the price surge, citing the need to "maintain market stability and producer revenue predictability."</p>
    `.trim(),
    author: 'Dhananjay Singh',
    category: 'Economy',
    image_url: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=1200&h=750&fit=crop',
    image_caption: 'Oil refinery complex operations illuminated at dusk, reflecting the critical role of petroleum infrastructure in global energy supply | Photo: Reuters / Energy Markets',
    video_url: null,
    featured: false,
    is_breaking: false,
    status: 'published',
    homepage_position: 14,
    tags: ['Oil', 'Energy', 'Markets', 'OPEC'],
    language: 'english',
    created_at: d(6), updated_at: d(3), published_at: d(3),
    imageUrl: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=1200&h=750&fit=crop',
    homepagePosition: 14, createdAt: d(6), updatedAt: d(3), publishedAt: d(3),
  },
  {
    id: 'n-0015-2026-09-06',
    title: 'Brussels Greenlights Fifteenth Sanctions Package Targeting Russian Sanctions-Evasion Networks',
    slug: 'eu-fifteenth-sanctions-package-russia',
    subtitle: 'The European Council approves new measures targeting third-country intermediaries, energy export ceilings, and shadow fleet tankers facilitating Russian oil shipments.',
    excerpt: 'The European Union approved its fifteenth package of sanctions against Russia, targeting a sophisticated network of third-country intermediaries and shadow fleet tankers used to circumvent existing trade restrictions.',
    content: `
      <p class="lead">The European Council formally approved the fifteenth package of economic sanctions against Russia on Friday, expanding the bloc's most extensive sanctions regime to target a sprawling network of third-country companies and individuals accused of helping Moscow evade existing trade restrictions and finance its war effort in Ukraine.</p>
      <p>The package names 78 new entities and 42 individuals across Turkey, the United Arab Emirates, Kazakhstan, and Georgia that EU investigators identified as key nodes in sanctions-circumvention supply chains for dual-use technology, including semiconductor components, precision machine tools, and navigation equipment.</p>
      <p>New measures also tighten energy export ceilings by lowering the price cap on Russian seaborne crude from $60 to $45 per barrel and introducing a mandatory hull-tracking registry for all tankers calling at EU ports to combat the growing Russian "shadow fleet" — an estimated 600 aging vessels operating without Western insurance coverage.</p>
      <p>European Commission President Ursula von der Leyen said the package demonstrated the EU's "unwavering determination to ensure that sanctions are not merely announced but effectively enforced."</p>
      <p>Russia's Foreign Ministry dismissed the measures as "economic self-harm masquerading as foreign policy" and warned of retaliatory restrictions on European agricultural imports and overflight rights.</p>
    `.trim(),
    author: 'Dhananjay Singh',
    category: 'World',
    image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=750&fit=crop',
    image_caption: 'European Council headquarters in Brussels, where the fifteenth sanctions package was formally adopted | Photo: European Council / Audiovisual Service',
    video_url: null,
    featured: false,
    is_breaking: false,
    status: 'published',
    homepage_position: 15,
    tags: ['EU', 'Russia', 'Sanctions', 'Ukraine'],
    language: 'english',
    created_at: d(14), updated_at: d(7), published_at: d(7),
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=750&fit=crop',
    homepagePosition: 15, createdAt: d(14), updatedAt: d(7), publishedAt: d(7),
  },
]
