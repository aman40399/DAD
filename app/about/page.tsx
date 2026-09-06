import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Chhkwa - तरक्की को चाहिए नया नज़रिया | Our Mission & Story',
  description: 'Chhkwa is a digital news platform committed to delivering thoughtful journalism, in-depth analysis, and diverse perspectives. Learn about our mission, values, editorial policy, and meet our team of dedicated journalists.',
  keywords: [
    'about chhkwa', 'about us', 'mission statement', 'journalism ethics', 
    'editorial policy', 'news platform', 'media company', 'Dhananjay Singh',
    'professional journalism', 'credible news source', 'fact-based reporting',
    'transparency in media', 'news values', 'journalistic integrity'
  ],
  openGraph: {
    title: 'About Chhkwa - Progress Needs a New Perspective',
    description: 'Learn about Chhkwa\'s mission to deliver quality journalism, meaningful conversations, and diverse perspectives on the stories that shape our world.',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'About Chhkwa',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Chhkwa - तरक्की को चाहिए नया नज़रिया',
    description: 'Thoughtful journalism, diverse perspectives, meaningful conversations.',
  },
  alternates: {
    canonical: '/about',
  },
}

export default function AboutPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 md:px-10 lg:px-20 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[1200px] flex-1">
            <Header />

            <main className="mt-8 mb-16">
              {/* Hero Section */}
              <div className="border-b-4 border-black dark:border-white pb-8 mb-8">
                <h1 className="text-primary dark:text-neutral-50 text-5xl md:text-6xl font-black font-body leading-tight mb-4">
                  About Chhkwa.com
                </h1>
                <p className="text-neutral-700 dark:text-neutral-300 text-2xl font-bold leading-relaxed font-body italic">
                  तरक्की को चाहिए नया नज़रिया | Progress Needs a New Perspective
                </p>
              </div>

              {/* English Section */}
              <div className="prose prose-lg max-w-none mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-4xl">🇬🇧</span>
                  <h2 className="text-primary dark:text-neutral-50 text-3xl font-bold font-body m-0">
                    English
                  </h2>
                </div>
                
                <p className="text-neutral-700 dark:text-neutral-300 text-lg font-body leading-relaxed mb-6">
                  <strong>Chhkwa.com</strong> is a digital platform dedicated to bringing thoughtful analysis, fresh perspectives, and meaningful conversations on topics that shape our world. We believe that progress requires a new lens—one that challenges conventional narratives and amplifies diverse voices.
                </p>

                <p className="text-neutral-700 dark:text-neutral-300 text-lg font-body leading-relaxed mb-6">
                  Our mission is to inform, inspire, and ignite change through content that matters. Whether it's politics, culture, technology, or social issues, we strive to present stories with depth, clarity, and integrity.
                </p>

                <h3 className="text-primary dark:text-neutral-50 text-2xl font-bold font-body mt-8 mb-4">
                  What We Stand For:
                </h3>
                <ul className="text-neutral-700 dark:text-neutral-300 text-lg font-body leading-relaxed space-y-3 mb-6">
                  <li><strong>Truth & Transparency:</strong> We prioritize facts, context, and accountability.</li>
                  <li><strong>Diversity of Thought:</strong> We celebrate different perspectives and encourage open dialogue.</li>
                  <li><strong>Empowerment:</strong> We aim to equip readers with knowledge to make informed decisions.</li>
                  <li><strong>Innovation:</strong> We embrace new ideas and approaches to storytelling.</li>
                </ul>

                <p className="text-neutral-700 dark:text-neutral-300 text-lg font-body leading-relaxed mb-6">
                  At <strong>Chhkwa.com</strong>, we don't just report the news—we explore the "why" and "what's next." Join us on this journey to reimagine progress, one story at a time.
                </p>
              </div>

              {/* Hindi Section */}
              <div className="prose prose-lg max-w-none mb-12 border-t-2 border-neutral-300 dark:border-neutral-700 pt-8">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-4xl">🇮🇳</span>
                  <h2 className="text-primary dark:text-neutral-50 text-3xl font-bold font-body m-0">
                    हिंदी
                  </h2>
                </div>
                
                <p className="text-neutral-700 dark:text-neutral-300 text-lg font-body leading-relaxed mb-6">
                  <strong>Chhkwa.com</strong> एक डिजिटल मंच है जो विचारशील विश्लेषण, नए दृष्टिकोण और उन विषयों पर सार्थक बातचीत लाने के लिए समर्पित है जो हमारी दुनिया को आकार देते हैं। हम मानते हैं कि तरक्की के लिए एक नया नज़रिया चाहिए—जो पारंपरिक कथाओं को चुनौती दे और विविध आवाज़ों को बुलंद करे।
                </p>

                <p className="text-neutral-700 dark:text-neutral-300 text-lg font-body leading-relaxed mb-6">
                  हमारा उद्देश्य ऐसी सामग्री के माध्यम से सूचित करना, प्रेरित करना और बदलाव लाना है जो मायने रखती है। चाहे वह राजनीति हो, संस्कृति, तकनीक या सामाजिक मुद्दे—हम गहराई, स्पष्टता और ईमानदारी के साथ कहानियाँ प्रस्तुत करने का प्रयास करते हैं।
                </p>

                <h3 className="text-primary dark:text-neutral-50 text-2xl font-bold font-body mt-8 mb-4">
                  हम किसके लिए खड़े हैं:
                </h3>
                <ul className="text-neutral-700 dark:text-neutral-300 text-lg font-body leading-relaxed space-y-3 mb-6">
                  <li><strong>सच्चाई और पारदर्शिता:</strong> हम तथ्यों, संदर्भ और जवाबदेही को प्राथमिकता देते हैं।</li>
                  <li><strong>विचारों की विविधता:</strong> हम अलग-अलग दृष्टिकोणों का सम्मान करते हैं और खुली बातचीत को प्रोत्साहित करते हैं।</li>
                  <li><strong>सशक्तिकरण:</strong> हम पाठकों को सूचित निर्णय लेने के लिए ज्ञान से लैस करने का लक्ष्य रखते हैं।</li>
                  <li><strong>नवाचार:</strong> हम कहानी सुनाने के लिए नए विचारों और दृष्टिकोणों को अपनाते हैं।</li>
                </ul>

                <p className="text-neutral-700 dark:text-neutral-300 text-lg font-body leading-relaxed mb-6">
                  <strong>Chhkwa.com</strong> पर, हम सिर्फ खबरें नहीं बताते—हम "क्यों" और "आगे क्या" को समझते हैं। इस यात्रा में हमारे साथ जुड़ें और तरक्की को नए सिरे से परिभाषित करें, एक कहानी के साथ।
                </p>
              </div>

              {/* Writer Section */}
              <div className="border-t-4 border-black dark:border-white pt-8">
                <h2 className="text-primary dark:text-neutral-50 text-3xl font-bold font-body mb-6">
                  About the Writer
                </h2>
                
                <div className="bg-neutral-50 dark:bg-neutral-900 p-8 rounded-sm border-l-4 border-blue-600">
                  <h3 className="text-primary dark:text-neutral-50 text-2xl font-bold font-body mb-3">
                    Dhananjay Singh
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm font-sans font-semibold mb-4 italic">
                    Professional Content Writer, Researcher & Visionary Storyteller
                  </p>
                  
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 text-base font-body leading-relaxed">
                    <p>
                      <strong>Dhananjay Singh</strong> is a professional content writer with a passion for exploring complex ideas and transforming them into compelling narratives. With a keen eye for detail and a commitment to authenticity, Dhananjay specializes in crafting content that resonates, informs, and inspires action.
                    </p>
                    
                    <p>
                      As a researcher and storyteller, Dhananjay brings a unique blend of analytical rigor and creative flair to every piece. Whether it's investigative journalism, thought leadership articles, or cultural commentary, the goal remains the same: to challenge perspectives and spark meaningful conversations.
                    </p>
                    
                    <p>
                      With experience spanning multiple domains—including politics, technology, social issues, and philosophy—Dhananjay believes in the power of words to shape reality. Every story is an opportunity to question the status quo and imagine new possibilities.
                    </p>
                    
                    <p className="font-semibold italic">
                      "तरक्की को चाहिए नया नज़रिया—और यह नज़रिया शब्दों से शुरू होता है।"<br />
                      <span className="text-sm">"Progress needs a new perspective—and that perspective begins with words."</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Section */}
              <div className="border-t border-neutral-300 dark:border-neutral-700 pt-8 mt-12">
                <h2 className="text-primary dark:text-neutral-50 text-3xl font-bold font-body mb-6">
                  Get in Touch
                </h2>
                <p className="text-neutral-700 dark:text-neutral-300 text-lg font-body leading-relaxed mb-4">
                  Have a story idea? Want to collaborate? Reach out to us at:
                </p>
                <p className="text-neutral-600 dark:text-neutral-400 font-sans text-base">
                  <strong>Email:</strong> contact@chhkwa.com<br />
                  <strong>Follow us on social media</strong> for the latest updates and insights.
                </p>
              </div>
            </main>

            <Footer />
          </div>
        </div>
      </div>
    </div>
  )
}
