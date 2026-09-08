/**
 * Test Fixtures: Sample articles, payloads, and mock data for E2E tests.
 * Authoritative source: PROJECT.md § Interface Contracts & Acceptance Criteria
 */

export const SAMPLE_ENGLISH_ARTICLE = {
  title: 'Global Climate Summit Reaches Historic Agreement on Coastal Defense Funding',
  subtitle: 'Delegates from 140 nations establish resilient infrastructure timeline for vulnerable coastlines',
  excerpt: 'A landmark consensus was finalized early Sunday morning allocating $50 billion toward seawall construction and flood mitigation across Pacific island nations.',
  content: `The United Nations Environmental Committee convened in Geneva this week to finalize what many observers are calling the most ambitious climate adaptation accord of the decade.

Over five intensive days of negotiations, delegates debated the precise funding mechanisms required to protect at-risk coastal population centers from accelerating sea level rise. The resulting accord guarantees direct capital infusions to municipalities facing immediate erosion crises.

"This is not merely an aspirational statement," remarked Chief Delegate Maria Santos during the plenary session. "This treaty delivers concrete engineering resources directly to the communities that need them most."

Initial disbursements are scheduled to begin in the third quarter, with monitoring stations established across thirty participating harbors to track project milestones and environmental metrics in real time.`,
  author: 'Dhananjay Singh',
  category: 'Environment',
  imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
  imageCaption: 'The Geneva plenary hall during the final voting session on coastal defense infrastructure | Photo: Reuters / Geneva Archive',
  featured: true,
  isBreaking: false,
  status: 'published',
  homepagePosition: 2,
  tags: ['Climate', 'Environment', 'Global', 'Policy'],
  language: 'english'
}

export const SAMPLE_HINDI_ARTICLE = {
  title: 'भारत ने अंतरिक्ष मिशन में रचा नया इतिहास',
  subtitle: 'भारतीय वैज्ञानिकों ने स्वदेशी रॉकेट तकनीक के साथ उपग्रह को सफलतापूर्वक कक्षा में स्थापित किया',
  excerpt: 'इसरो के वैज्ञानिकों ने श्रीहरिकोटा अंतरिक्ष केंद्र से अत्याधुनिक मौसम उपग्रह का सफल प्रक्षेपण किया।',
  content: `भारतीय अंतरिक्ष अनुसंधान संगठन (इसरो) ने आज सुबह श्रीहरिकोटा के सतीश धवन अंतरिक्ष केंद्र से अपने नवीनतम भू-स्थिर उपग्रह का सफल प्रक्षेपण किया।

यह मिशन भारत की स्वदेशी अंतरिक्ष क्षमताओं में एक महत्वपूर्ण मील का पत्थर साबित होगा। वैज्ञानिकों की एक समर्पित टीम ने पिछले तीन वर्षों से इस क्रायोजेनिक इंजन के विकास पर कार्य किया है।

इसरो अध्यक्ष ने मिशन नियंत्रण कक्ष से वैज्ञानिकों और देशवासियों को बधाई देते हुए कहा कि यह उपलब्धि हमारे युवाओं की वैज्ञानिक प्रतिभा का प्रमाण है।`,
  author: 'Dhananjay Singh',
  category: 'Technology',
  imageUrl: 'https://images.unsplash.com/photo-1517976487504-59a1a0b82f22?auto=format&fit=crop&w=1600&q=80',
  imageCaption: 'श्रीहरिकोटा प्रक्षेपण पैड से उपग्रह ले जाने वाले रॉकेट का सफल उत्थापन | Photo: ISRO / Press Bureau',
  featured: false,
  isBreaking: true,
  status: 'published',
  homepagePosition: 1,
  tags: ['Space', 'Technology', 'ISRO', 'India'],
  language: 'hindi'
}

export const SAMPLE_DRAFT_ARTICLE = {
  title: 'Confidential Internal Review: Regional Transit Modernization Plan',
  subtitle: 'Draft recommendations pending executive review before public release',
  excerpt: 'A preliminary blueprint for regional rail electrification and light-rail expansion across metropolitan corridors.',
  content: `This document contains preliminary findings prepared by the Metropolitan Transit Authority regarding capital expenditure allocations for the upcoming fiscal cycle.

Key proposals include the conversion of diesel commuter routes to overhead catenary electric power, which is projected to reduce corridor carbon emissions by 42% over six operating years.

Staff feedback and union consultations are currently underway. No public dissemination should occur prior to official board authorization.`,
  author: 'Dhananjay Singh',
  category: 'Metropolitan',
  imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1600&q=80',
  imageCaption: 'A prototype electrified passenger carriage undergoing track testing | Photo: Metro Transit Archives',
  featured: false,
  isBreaking: false,
  status: 'draft',
  homepagePosition: null,
  tags: ['Transit', 'Urban', 'Infrastructure'],
  language: 'english'
}

export const SAMPLE_BREAKING_ARTICLE = {
  title: 'BREAKING: Global Monetary Council Announces Immediate Emergency Rate Adjustment',
  subtitle: 'Coordinated action taken across central banks to stabilize currency fluctuations',
  excerpt: 'In an unscheduled emergency briefing, governors announced a 50-basis-point reduction to bolster international liquidity.',
  content: `The emergency council assembled via secure teleconference at 04:00 GMT following unprecedented volatility in Asian overnight bond markets.

The unanimous policy directive authorizes synchronized interventions across major central reserve facilities. Market analysts report immediate stabilization in early European exchange trading.`,
  author: 'Marcus Sterling',
  category: 'Economy',
  imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1600&q=80',
  imageCaption: 'Central Bank headquarters during the emergency announcement briefing | Photo: Financial Times / AP',
  featured: true,
  isBreaking: true,
  status: 'published',
  homepagePosition: 1,
  tags: ['Breaking', 'Economy', 'Markets', 'Finance'],
  language: 'english'
}

// Minimal 1x1 WebP base64 image data for mock upload testing
export const MOCK_WEBP_IMAGE_BASE64 = 'UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA=='
export const MOCK_PNG_IMAGE_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
