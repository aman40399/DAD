export interface EditorialTenet {
  id: string
  label: string // e.g. "Tenet 01"
  title: string // e.g. "Fearless Independence"
  description: string // e.g. "We accept no venture backing..."
}

export interface ColophonItem {
  id: string
  title: string // e.g. "Typography"
  description: string // e.g. "Typeset in Source Serif 4..."
}

export interface AboutConfig {
  // 1. Meta & Header
  metaTitle: string
  metaDescription: string
  breadcrumbSubtitle: string
  eyebrow: string
  headline: string
  missionStatement: string
  showDivider: boolean

  // 2. Founder & Editorial Profile
  authorName: string
  authorRole: string
  authorPhotoUrl: string
  authorPhotoAlt: string
  authorBio: string
  locationText: string
  inquiriesEmail: string

  // 3. Editorial Tenets / Pillars
  tenetsHeading: string
  tenets: EditorialTenet[]

  // 4. Colophon & Standards
  colophonHeading: string
  colophonItems: ColophonItem[]

  // 5. Legal & Ethics Banner
  legalHeading: string
  legalDescription: string
  legalButtonText: string
  legalButtonUrl: string
  showLegalBanner: boolean

  // 6. Mobile & Visual Variants
  mobileVariant: {
    photoPosition: 'top' | 'center' | 'left'
    compactTenets: boolean
    showColophon: boolean
    denseSpacing: boolean
  }
}

export const DEFAULT_ABOUT_CONFIG: AboutConfig = {
  metaTitle: 'About Us — Singh.monster | जहाँ तकनीक बनती है बेहद आसान',
  metaDescription:
    'Singh.monster पर आपका हार्दिक स्वागत है। जानिए धनंजय सिंह (बलिया, उत्तर प्रदेश) और Singh.monster के डिजिटल टेक एवं साइबर सुरक्षा मिशन के बारे में।',
  breadcrumbSubtitle: 'डिजिटल मंच • Est. 2026',
  eyebrow: 'हमारी कहानी एवं उद्देश्य',
  headline: 'Welcome to Singh.monster – जहाँ तकनीक बनती है बेहद आसान!',
  missionStatement:
    'नमस्कार दोस्तों, Singh.monster पर आपका हार्दिक स्वागत है। यह वेबसाइट कोई साधारण टेक ब्लॉग नहीं है, बल्कि एक ऐसा डिजिटल मंच है जहाँ कठिन और उलझी हुई टेक्नोलॉजी को आपकी अपनी सरल और बोलचाल की भाषा में परोसा जाता है।',
  showDivider: true,

  authorName: 'धनंजय सिंह (Dhananjay Singh)',
  authorRole: 'संस्थापक एवं मुख्य संपादक (Founder & Editor-in-Chief)',
  authorPhotoUrl: '/authr.png',
  authorPhotoAlt: 'धनंजय सिंह — Founder & Editor-in-Chief',
  authorBio:
    'मेरा नाम धनंजय सिंह है और मैं उत्तर प्रदेश के ऐतिहासिक जिले बलिया का रहने वाला हूँ। मुश्किल से मुश्किल बात को चुटकियों में समझा देना, यह खूबी मुझे मेरे पिताजी से विरासत में मिली है। बचपन से मैंने अपने पिताजी को देखा है कि वे जहाँ भी बैठते थे, लोग उनकी बातों को मंत्रमुग्ध होकर सुनते थे। वही कला आज मेरे भीतर भी है। जब भी मैं अपने आस-पास के लोगों को तकनीक के बारे में बताना शुरू करता हूँ, तो लोग रुककर मेरी बातों को ध्यान से सुनते हैं। बस इसी हुनर को एक कदम आगे ले जाते हुए मैंने Singh.monster की शुरुआत की है, ताकि यह ज्ञान इंटरनेट के माध्यम से पूरे देश के आम लोगों तक पहुँच सके।',
  locationText: 'बलिया, उत्तर प्रदेश (Ballia, UP)',
  inquiriesEmail: 'editorial@singhmonster.com',

  tenetsHeading: 'हम इस वेबसाइट पर क्या शेयर करते हैं?',
  tenets: [
    {
      id: 'tenet-1',
      label: 'विषय 01',
      title: 'सरल टेक गाइड (Tech Guides & How-To)',
      description:
        'आपके मोबाइल, लैपटॉप और ऐप्स से जुड़ी रोज़मर्रा की समस्याओं के आसान और स्टेप-बाय-स्टेप समाधान।',
    },
    {
      id: 'tenet-2',
      label: 'विषय 02',
      title: 'डिजिटल और साइबर सुरक्षा (Digital & Cyber Safety)',
      description:
        'ऑनलाइन स्कैम, फ्रॉड और हैकिंग से बचने के अचूक तरीके ताकि आपकी गाढ़ी कमाई और डेटा हमेशा सुरक्षित रहे।',
    },
    {
      id: 'tenet-3',
      label: 'विषय 03',
      title: 'एआई और स्मार्ट टूल्स (Everyday AI)',
      description:
        'ChatGPT और नए AI टूल्स का उपयोग करके आप अपने रोज़ के काम और पढ़ाई को कैसे आसान बना सकते हैं।',
    },
    {
      id: 'tenet-4',
      label: 'विषय 04',
      title: 'इंटरनेट से सही कमाई (Genuine Online Earnings)',
      description:
        'बिना किसी धोखेबाज़ी के, इंटरनेट और डिजिटल स्किल्स की मदद से पैसे कमाने के असली और व्यावहारिक तरीके।',
    },
  ],

  colophonHeading: 'हमारा मुख्य उद्देश्य (Our Core Mission)',
  colophonItems: [
    {
      id: 'col-1',
      title: 'सरल भाषा में तकनीक',
      description:
        'जटिल से जटिल टेक न्यूज़, गाइड और साइबर सुरक्षा से जुड़ी जानकारियों को इतनी आसान भाषा में समझाना, जिसे एक छोटा बच्चा भी समझ सके।',
    },
    {
      id: 'col-2',
      title: 'डिजिटल सुरक्षा व जागरूकता',
      description:
        'रोज़ नए ऐप्स, AI और ऑनलाइन फ्रॉड (Cyber Scams) के बढ़ते दौर में आम जनता को तकनीकी शब्दों के जाल से निकालकर सुरक्षित व सशक्त बनाना।',
    },
    {
      id: 'col-3',
      title: '100% जाँचे-परखे आर्टिकल्स',
      description:
        'गूगल के सभी सुरक्षा और गुणवत्ता मानकों (Google Policy Guidelines) को ध्यान में रखते हुए 100% सटीक और प्रमाणित सामग्री।',
    },
  ],

  legalHeading: 'हमसे संपर्क करें (Contact Us)',
  legalDescription:
    'हम अपने पाठकों के विचारों और सुझावों का बेहद सम्मान करते हैं। यदि आपके पास कोई सवाल है, तकनीक से जुड़ी समस्या है, या कोई सुझाव है, तो सीधे हमसे संपर्क करें। Singh.monster पर आने के लिए आपका दिल से धन्यवाद—चलो मिलकर टेक्नोलॉजी को आसान बनाते हैं!',
  legalButtonText: 'संपर्क करें →',
  legalButtonUrl: '/privacy',
  showLegalBanner: true,

  mobileVariant: {
    photoPosition: 'center',
    compactTenets: false,
    showColophon: true,
    denseSpacing: false,
  },
}
