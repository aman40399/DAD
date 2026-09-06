import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import YouTubeEmbed from '@/components/YouTubeEmbed'

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-white dark:bg-background-dark">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center">
          <div className="layout-content-container flex flex-col w-full flex-1">
            <Header />

            {/* Main Content */}
            <main className="px-4 md:px-10 lg:px-20 max-w-[1400px] mx-auto w-full">
              {/* Breaking News Banner */}
              <div className="bg-red-600 text-white py-2 px-4 -mx-4 md:-mx-10 lg:-mx-20 mb-6 mt-4">
                <div className="max-w-[1400px] mx-auto flex items-center gap-3">
                  <span className="font-bold text-xs uppercase tracking-wider">Breaking News</span>
                  <span className="text-sm font-sans">
                    Global Leaders Convene for Emergency Climate Summit in Geneva
                  </span>
                </div>
              </div>
              {/* Hero Section */}
              <div className="flex flex-col gap-6 py-6 lg:flex-row border-b-2 border-black dark:border-white pb-8 mb-8">
                <div className="flex flex-col gap-4 lg:w-2/3 lg:pr-8 lg:border-r-2 border-neutral-300 dark:border-neutral-700">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-sans font-bold text-blue-600 uppercase tracking-wider">
                      World News
                    </span>
                  </div>
                  <h2 className="text-primary dark:text-neutral-50 text-4xl md:text-5xl font-black font-body leading-[1.1] tracking-tight hover:underline cursor-pointer">
                    Historic Peace Treaty Signed, Heralding a New Era of Global Cooperation
                  </h2>
                  <p className="text-neutral-700 dark:text-neutral-300 text-lg md:text-xl font-normal leading-relaxed font-body">
                    After months of intense negotiations, world leaders have signed a landmark treaty aimed at resolving long-standing conflicts and fostering economic collaboration. The agreement marks a significant shift in international relations.
                  </p>
                  <div className="flex items-center gap-2 text-xs font-sans text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                    <Link href="/author/sarah-mitchell" className="hover:underline font-semibold">
                      By Sarah Mitchell
                    </Link>
                    <span>•</span>
                    <span>2 hours ago</span>
                  </div>
                </div>
                <div className="w-full lg:w-1/3">
                  <div
                    className="w-full bg-center bg-no-repeat aspect-[4/3] bg-cover grayscale hover:grayscale-0 transition-all cursor-pointer"
                    style={{
                      backgroundImage:
                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBbNxn5ttIVefDT6waGJXhpJNwLS6OIQ6G2mlpwHSUIF2v0EX8pAy-4-ZuUXXom81-5ALOO4n1qQl8NR_FqnubWEb2VQGGC1Kf2TFWPwsDn1xe4XtPgIFXsprjWZFkxTCgK_gIlwesk9fzgOpOJv9EUQR75N6QrOBZGv5nVMdBHgEj63fm9fXftnzNDVL_oOPVE3PwadpaIyBZMkHRo9AnSfUdIPVcIAu3eitGeL5MUv7dswzdK6d0xUzbhvGngLN2JoTAsvxoNR2K2")',
                    }}
                  ></div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans mt-2 italic">
                    World leaders shake hands at the historic Geneva Summit.
                  </p>
                </div>
              </div>

              {/* World News Section */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-primary dark:text-neutral-50 text-2xl font-black font-body leading-tight tracking-tight pb-2 border-b-4 border-black dark:border-white inline-block">
                    World News
                  </h2>
                  <Link href="/section/world" className="text-blue-600 hover:underline text-sm font-sans font-semibold">
                    See All →
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
                  <article className="flex flex-col gap-3 pb-4 border-b border-neutral-200 dark:border-neutral-700 lg:border-none hover:bg-neutral-50 dark:hover:bg-neutral-900 p-2 -mx-2 transition-colors cursor-pointer">
                    <div
                      className="w-full bg-center bg-no-repeat aspect-video bg-cover grayscale hover:grayscale-0 transition-all"
                      style={{
                        backgroundImage:
                          'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBM04fdAUbTL8DL4vul_TneTdxPV70ayyBuSyyuUkgQcJVIa9geq7F4Or0nhzN85m57D8stor6H4NBj1SjtEGpC9Eh9OQ_YoZlPdAfTi1MvaITQ70Euc_IvlO6-MNtO1CYq1whKBoFAkaYaOzNm9g5cKJHBNwjU-ez3HHt5zbG2v-WiwRscapyv28-poN7JwYu2AQuUA53RBadN6Hv0dYB8O6EieszqxX3r9maDPhIMj2fuXeZLLdeL69o_Dsjl-hSKoUy3io55nrJK")',
                      }}
                    ></div>
                    <div>
                      <h3 className="text-primary dark:text-neutral-50 text-lg font-bold font-body leading-tight hover:underline mb-2">
                        European Union Agrees on New Climate Change Pact
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm font-normal leading-normal font-body mb-2">
                        The agreement aims to reduce carbon emissions by 55% by 2030, setting ambitious targets for member nations.
                      </p>
                      <Link href="/author/maria-rodriguez" className="text-xs text-neutral-500 hover:underline font-sans">
                        By Maria Rodriguez
                      </Link>
                    </div>
                  </article>
                  <article className="flex flex-col gap-3 pb-4 border-b border-neutral-200 dark:border-neutral-700 lg:border-none hover:bg-neutral-50 dark:hover:bg-neutral-900 p-2 -mx-2 transition-colors cursor-pointer">
                    <div
                      className="w-full bg-center bg-no-repeat aspect-video bg-cover grayscale hover:grayscale-0 transition-all"
                      style={{
                        backgroundImage:
                          'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBxg0tWvwne_nIORVPD3Ld-E_zevI2u3x3aO9Gmh8aPH8hd2i399vh3Tf7xeXXISKMwkez3yfPoHEOjSdYZfEDTYF2gg9CMalyur6nizgUP7Zn4VwIPvEplsw8d2D7YUUBbTbIZg97ZmCUDWhEDXpMrHh43wMbKZsyyMOnVRHs3yi7wkjdOYXXRr8WNwPMPcnsKSs_LoAbSwhyli9GNMkhON6raGqK73MkdYjnqLlsMNwCmm63sipMU7gMO7BxHGlaVZ9yD2varHuah")',
                      }}
                    ></div>
                    <div>
                      <h3 className="text-primary dark:text-neutral-50 text-lg font-bold font-body leading-tight hover:underline mb-2">
                        Political Tensions Rise in South China Sea
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm font-normal leading-normal font-body mb-2">
                        Naval exercises by multiple nations increase regional instability as diplomatic talks stall.
                      </p>
                      <Link href="/author/maria-rodriguez" className="text-xs text-neutral-500 hover:underline font-sans">
                        By Maria Rodriguez
                      </Link>
                    </div>
                  </article>
                  <div className="flex flex-col gap-3 text-sm font-sans">
                    <h3 className="text-primary dark:text-neutral-50 font-bold text-base mb-2">More Headlines</h3>
                    <div className="space-y-3 divide-y divide-neutral-200 dark:divide-neutral-700">
                      <p className="text-primary dark:text-neutral-200 pt-2 first:pt-0 pb-2 hover:underline cursor-pointer leading-tight">
                        U.N. Warns of Famine Risk in Conflict Zones as Aid Access Restricted
                      </p>
                      <p className="text-primary dark:text-neutral-200 pt-2 pb-2 hover:underline cursor-pointer leading-tight">
                        African Nations Launch Joint Economic Initiative for Regional Development
                      </p>
                      <p className="text-primary dark:text-neutral-200 pt-2 pb-2 hover:underline cursor-pointer leading-tight">
                        Analysis: The Shifting Alliances in the Middle East Reshape Global Politics
                      </p>
                      <p className="text-primary dark:text-neutral-200 pt-2 pb-2 hover:underline cursor-pointer leading-tight">
                        Summit on Nuclear Disarmament Scheduled for Next Month
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technology Section with Video */}
              <div className="border-t-2 border-neutral-300 dark:border-neutral-700 pt-12 mt-12 mb-12">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-primary dark:text-neutral-50 text-2xl font-black font-body leading-tight tracking-tight pb-2 border-b-4 border-black dark:border-white inline-block">
                    Technology
                  </h2>
                  <Link href="/section/technology" className="text-blue-600 hover:underline text-sm font-sans font-semibold">
                    See All →
                  </Link>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                  <div>
                    <YouTubeEmbed 
                      videoId="dQw4w9WgXcQ" 
                      title="The Future of AI Technology"
                      className="mb-4"
                    />
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-sans font-bold text-blue-600 uppercase tracking-wider">
                        Video
                      </span>
                    </div>
                    <h3 className="text-primary dark:text-neutral-50 text-2xl font-bold font-body leading-tight hover:underline cursor-pointer mb-2">
                      The Future of Artificial Intelligence: Expert Panel Discussion
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-base font-body mb-2">
                      Leading AI researchers discuss the implications of emerging technologies and their impact on society, economy, and daily life.
                    </p>
                    <Link href="/author/david-thompson" className="text-xs text-neutral-500 hover:underline font-sans">
                      By David Thompson
                    </Link>
                  </div>
                  <div className="space-y-6">
                    <article className="border-b border-neutral-200 dark:border-neutral-700 pb-6 last:border-b-0">
                      <h3 className="text-primary dark:text-neutral-50 text-xl font-bold font-body leading-tight hover:underline cursor-pointer mb-2">
                        Tech Giants Face New Antitrust Legislation
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm font-body mb-2">
                        Congress proposes sweeping reforms to regulate big tech companies amid growing concerns about market dominance and data privacy.
                      </p>
                      <Link href="/author/david-thompson" className="text-xs text-neutral-500 hover:underline font-sans">
                        By David Thompson • 4 hours ago
                      </Link>
                    </article>
                    <article className="border-b border-neutral-200 dark:border-neutral-700 pb-6 last:border-b-0">
                      <h3 className="text-primary dark:text-neutral-50 text-xl font-bold font-body leading-tight hover:underline cursor-pointer mb-2">
                        Breakthrough in Quantum Computing Achieved
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm font-body mb-2">
                        Scientists announce major advancement that could revolutionize computing power and solve previously impossible calculations.
                      </p>
                      <Link href="/author/david-thompson" className="text-xs text-neutral-500 hover:underline font-sans">
                        By David Thompson • 1 day ago
                      </Link>
                    </article>
                    <article>
                      <h3 className="text-primary dark:text-neutral-50 text-xl font-bold font-body leading-tight hover:underline cursor-pointer mb-2">
                        Cybersecurity Threats Evolve in 2025
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm font-body mb-2">
                        Experts warn of new sophisticated attacks targeting critical infrastructure as cyber warfare escalates globally.
                      </p>
                      <Link href="/author/david-thompson" className="text-xs text-neutral-500 hover:underline font-sans">
                        By David Thompson • 2 days ago
                      </Link>
                    </article>
                  </div>
                </div>
              </div>

              {/* Business Section */}
              <div className="border-t-2 border-neutral-300 dark:border-neutral-700 pt-12 mt-12 mb-12">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-primary dark:text-neutral-50 text-2xl font-black font-body leading-tight tracking-tight pb-2 border-b-4 border-black dark:border-white inline-block">
                    Business
                  </h2>
                  <Link href="/section/business" className="text-blue-600 hover:underline text-sm font-sans font-semibold">
                    See All →
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                  <article className="md:col-span-2 border-r-0 md:border-r-2 border-neutral-300 dark:border-neutral-700 md:pr-8">
                    <div className="mb-4">
                      <div
                        className="w-full bg-center bg-no-repeat aspect-[16/9] bg-cover grayscale hover:grayscale-0 transition-all cursor-pointer mb-4"
                        style={{
                          backgroundImage:
                            'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=675&fit=crop")',
                        }}
                      ></div>
                      <h3 className="text-primary dark:text-neutral-50 text-3xl font-bold font-body leading-tight hover:underline cursor-pointer mb-3">
                        Stock Markets Rally as Economic Indicators Show Growth
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400 text-base font-body mb-3 leading-relaxed">
                        Major indices reach record highs following positive employment data and corporate earnings reports that exceed analyst expectations across multiple sectors.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <span className="font-sans">By Business Desk</span>
                        <span>•</span>
                        <span>3 hours ago</span>
                      </div>
                    </div>
                  </article>
                  <div className="space-y-5">
                    <article className="border-b border-neutral-200 dark:border-neutral-700 pb-5">
                      <h4 className="text-primary dark:text-neutral-50 text-lg font-bold font-body leading-tight hover:underline cursor-pointer mb-2">
                        Federal Reserve Signals Interest Rate Changes
                      </h4>
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm font-body">
                        Central bank officials hint at policy shifts in response to inflation trends.
                      </p>
                    </article>
                    <article className="border-b border-neutral-200 dark:border-neutral-700 pb-5">
                      <h4 className="text-primary dark:text-neutral-50 text-lg font-bold font-body leading-tight hover:underline cursor-pointer mb-2">
                        Startup Valuations Soar in Tech Sector
                      </h4>
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm font-body">
                        Venture capital funding reaches new heights as investors bet on innovation.
                      </p>
                    </article>
                    <article>
                      <h4 className="text-primary dark:text-neutral-50 text-lg font-bold font-body leading-tight hover:underline cursor-pointer mb-2">
                        Global Supply Chains Stabilize After Years of Disruption
                      </h4>
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm font-body">
                        Manufacturing and logistics sectors report improved efficiency and reduced delays.
                      </p>
                    </article>
                  </div>
                </div>
              </div>

              {/* Local News Section */}
              <div className="border-t-2 border-neutral-300 dark:border-neutral-700 pt-12 mt-12 mb-12">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-primary dark:text-neutral-50 text-2xl font-black font-body leading-tight tracking-tight pb-2 border-b-4 border-black dark:border-white inline-block">
                    Local News
                  </h2>
                  <Link href="/section/local" className="text-blue-600 hover:underline text-sm font-sans font-semibold">
                    See All →
                  </Link>
                </div>
                <div className="pt-4">
                  <h3 className="text-primary dark:text-neutral-200 text-xl font-bold font-body leading-normal pb-3 mb-6 border-b-2 border-neutral-300 dark:border-neutral-600">
                    City Center
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-3 pb-3">
                      <div
                        className="w-full bg-center bg-no-repeat aspect-square bg-cover"
                        style={{
                          backgroundImage:
                            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAVnsl2Sd8-3W30FxhBoR-SPnTlz5RM9jRWJ2lSE-pShjMdIN758yxJOxsmpz7QGBB1XAPkfiZN-k689ULlX6eHnc7kfVVsIY9BNAeFNF4KfLEa572CEUzWcLlcInlfYrUT7d5nFBmfu3glvj9ippDDn8MAy5OptLZ4e1rn58qxXInak8m1piwMfENajPCVT916R5E6p_gpvUkj9fmOx-OgBgREqTxgPVR7yqfCrtW1oA4OyeRzkc2JPAQjO63iS2FC22pRQZzCho37")',
                          filter: 'grayscale(50%)',
                        }}
                      ></div>
                      <div>
                        <p className="text-primary dark:text-neutral-50 text-base font-bold font-body leading-snug">
                          New Public Library Opens Downtown
                        </p>
                        <p className="text-neutral-600 dark:text-neutral-400 text-sm font-normal leading-normal font-body">
                          The state-of-the-art facility features a tech hub and community spaces.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 pb-3">
                      <div
                        className="w-full bg-center bg-no-repeat aspect-square bg-cover"
                        style={{
                          backgroundImage:
                            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAlUTlqw7m-7lqLNmzcBq5wqcu39gGVBS_xL-46W0iKgXtsQKtHtECh5XvroQqB_gCcQFxm6fy7Uq_5Fz_mszpjpdwvXYtqdCQbzb_zm3li3GgrhK8_9DkMHLqOyXtka0ZE65xqwICuM_j908ku3HHC2tYYkyGJcn7G1v5hlFgbEaOCH9npKWYjVNunoJddkQKP0CXCjBuyypg6ssdOpOK9oPFHKSkmeLxT2xqsDbBLVCAKXmx4kno-RjoX75mJmX_7YLnUj5M2zKe6")',
                          filter: 'grayscale(50%)',
                        }}
                      ></div>
                      <div>
                        <p className="text-primary dark:text-neutral-50 text-base font-bold font-body leading-snug">
                          Annual Food Festival Kicks Off in Central Park
                        </p>
                        <p className="text-neutral-600 dark:text-neutral-400 text-sm font-normal leading-normal font-body">
                          A celebration of culinary diversity, attracting thousands of visitors.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 pb-3">
                      <div
                        className="w-full bg-center bg-no-repeat aspect-square bg-cover"
                        style={{
                          backgroundImage:
                            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBHOY5JapD4xg3a_lVru82Rsrdx0jrh6WJhifmXK7RU5ZPYu7g9KdEgT-JAe4f_Ncc3tncTOxJnQG3U2AL5d1ut8RiJZkBlEnFkMY_-CGMpZqSK9b6ryjw-M2sDUesC-1_neEywqwx3ST4fLch-oDw67kw48zsHxUMpAnjhjptGU-2CXquCRSUR2Vh-THwcf6dXPxXzZWzC-iPpHcEaUmxnm9HeOghNY_SjjXLhRvXZ7oaUJiTpNIF8IaB0In-I6P3QHEKq-FPyTnac")',
                          filter: 'grayscale(50%)',
                        }}
                      ></div>
                      <div>
                        <p className="text-primary dark:text-neutral-50 text-base font-bold font-body leading-snug">
                          City Council Approves New Bike Lane Initiative
                        </p>
                        <p className="text-neutral-600 dark:text-neutral-400 text-sm font-normal leading-normal font-body">
                          Project aims to enhance cyclist safety and promote green transport.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sports Section */}
              <div className="border-t-2 border-neutral-300 dark:border-neutral-700 pt-12 mt-12 mb-12">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-primary dark:text-neutral-50 text-2xl font-black font-body leading-tight tracking-tight pb-2 border-b-4 border-black dark:border-white inline-block">
                    Sports
                  </h2>
                  <Link href="/section/sports" className="text-blue-600 hover:underline text-sm font-sans font-semibold">
                    See All →
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                  <div className="md:col-span-2 border-r-0 md:border-r-2 border-neutral-300 dark:border-neutral-700 md:pr-8">
                    <div
                      className="w-full bg-center bg-no-repeat aspect-video bg-cover grayscale hover:grayscale-0 transition-all cursor-pointer"
                      style={{
                        backgroundImage:
                          'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBM04fdAUbTL8DL4vul_TneTdxPV70ayyBuSyyuUkgQcJVIa9geq7F4Or0nhzN85m57D8stor6H4NBj1SjtEGpC9Eh9OQ_YoZlPdAfTi1MvaITQ70Euc_IvlO6-MNtO1CYq1whKBoFAkaYaOzNm9g5cKJHBNwjU-ez3HHt5zbG2v-WiwRscapyv28-poN7JwYu2AQuUA53RBadN6Hv0dYB8O6EieszqxX3r9maDPhIMj2fuXeZLLdeL69o_Dsjl-hSKoUy3io55nrJK")',
                      }}
                    ></div>
                    <div className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-sans font-bold text-red-600 uppercase tracking-wider">
                          Breaking
                        </span>
                      </div>
                      <h3 className="text-primary dark:text-neutral-50 text-2xl md:text-3xl font-bold font-body leading-tight hover:underline cursor-pointer mb-3">
                        Local Team Clinches Championship in Dramatic Final Seconds
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400 text-base font-body leading-relaxed mb-2">
                        A stunning last-second victory secures the championship title in what experts are calling one of the greatest comebacks in sports history.
                      </p>
                      <span className="text-xs text-neutral-500 font-sans">Sports Desk • 30 minutes ago</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-6">
                    <article className="flex gap-4 items-start hover:bg-neutral-50 dark:hover:bg-neutral-900 p-2 -mx-2 transition-colors cursor-pointer">
                      <div
                        className="w-24 h-24 bg-center bg-no-repeat bg-cover flex-shrink-0 grayscale"
                        style={{
                          backgroundImage:
                            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAVnsl2Sd8-3W30FxhBoR-SPnTlz5RM9jRWJ2lSE-pShjMdIN758yxJOxsmpz7QGBB1XAPkfiZN-k689ULlX6eHnc7kfVVsIY9BNAeFNF4KfLEa572CEUzWcLlcInlfYrUT7d5nFBmfu3glvj9ippDDn8MAy5OptLZ4e1rn58qxXInak8m1piwMfENajPCVT916R5E6p_gpvUkj9fmOx-OgBgREqTxgPVR7yqfCrtW1oA4OyeRzkc2JPAQjO63iS2FC22pRQZzCho37")',
                        }}
                      ></div>
                      <div className="flex-1">
                        <h4 className="text-primary dark:text-neutral-50 text-base font-bold font-body leading-tight hover:underline mb-1">
                          Athlete Spotlight: The Meteoric Rise of Tennis Prodigy
                        </h4>
                        <p className="text-xs text-neutral-500 font-sans">1 hour ago</p>
                      </div>
                    </article>
                    <article className="flex gap-4 items-start hover:bg-neutral-50 dark:hover:bg-neutral-900 p-2 -mx-2 transition-colors cursor-pointer">
                      <div
                        className="w-24 h-24 bg-center bg-no-repeat bg-cover flex-shrink-0 grayscale"
                        style={{
                          backgroundImage:
                            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBxg0tWvwne_nIORVPD3Ld-E_zevI2u3x3aO9Gmh8aPH8hd2i399vh3Tf7xeXXISKMwkez3yfPoHEOjSdYZfEDTYF2gg9CMalyur6nizgUP7Zn4VwIPvEplsw8d2D7YUUBbTbIZg97ZmCUDWhEDXpMrHh43wMbKZsyyMOnVRHs3yi7wkjdOYXXRr8WNwPMPcnsKSs_LoAbSwhyli9GNMkhON6raGqK73MkdYjnqLlsMNwCmm63sipMU7gMO7BxHGlaVZ9yD2varHuah")',
                        }}
                      ></div>
                      <div className="flex-1">
                        <h4 className="text-primary dark:text-neutral-50 text-base font-bold font-body leading-tight hover:underline mb-1">
                          City Marathon Sees Record Participation Numbers
                        </h4>
                        <p className="text-xs text-neutral-500 font-sans">3 hours ago</p>
                      </div>
                    </article>
                    <article className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                      <h4 className="text-primary dark:text-neutral-50 text-base font-bold font-body leading-tight hover:underline mb-2">
                        Olympic Trials Begin for National Team Selection
                      </h4>
                      <p className="text-xs text-neutral-500 font-sans">5 hours ago</p>
                    </article>
                  </div>
                </div>
              </div>

              {/* Entertainment Section */}
              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-8 mt-8">
                <h2 className="text-primary dark:text-neutral-50 text-xl font-bold font-body leading-tight tracking-[-0.015em] px-0 pb-3 border-b border-black dark:border-white">
                  Entertainment
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                  <div>
                    <h3 className="text-primary dark:text-neutral-200 text-lg font-bold font-body leading-normal pb-2 mb-4 border-b border-neutral-300 dark:border-neutral-600">
                      Movies
                    </h3>
                    <div className="flex flex-col gap-4 divide-y divide-neutral-200 dark:divide-neutral-700">
                      <div className="flex gap-4 pt-4 first:pt-0">
                        <div className="w-2/3">
                          <p className="text-primary dark:text-neutral-50 text-base font-bold font-body leading-snug">
                            Summer Blockbuster &quot;Galaxy Quest&quot; Exceeds Box Office Expectations
                          </p>
                          <p className="text-neutral-600 dark:text-neutral-400 text-sm font-normal leading-normal font-body mt-1">
                            The sci-fi epic is a hit with critics and audiences alike.
                          </p>
                        </div>
                        <div
                          className="w-1/3 bg-center bg-no-repeat aspect-square bg-cover"
                          style={{
                            backgroundImage:
                              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAlUTlqw7m-7lqLNmzcBq5wqcu39gGVBS_xL-46W0iKgXtsQKtHtECh5XvroQqB_gCcQFxm6fy7Uq_5Fz_mszpjpdwvXYtqdCQbzb_zm3li3GgrhK8_9DkMHLqOyXtka0ZE65xqwICuM_j908ku3HHC2tYYkyGJcn7G1v5hlFgbEaOCH9npKWYjVNunoJddkQKP0CXCjBuyypg6ssdOpOK9oPFHKSkmeLxT2xqsDbBLVCAKXmx4kno-RjoX75mJmX_7YLnUj5M2zKe6")',
                            filter: 'brightness(1.1)',
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-primary dark:text-neutral-200 text-lg font-bold font-body leading-normal pb-2 mb-4 border-b border-neutral-300 dark:border-neutral-600">
                      Music
                    </h3>
                    <div className="flex flex-col gap-4 divide-y divide-neutral-200 dark:divide-neutral-700">
                      <div className="flex gap-4 pt-4 first:pt-0">
                        <div className="w-2/3">
                          <p className="text-primary dark:text-neutral-50 text-base font-bold font-body leading-snug">
                            Surprise Album Drop by Pop Superstar Dominates Charts
                          </p>
                          <p className="text-neutral-600 dark:text-neutral-400 text-sm font-normal leading-normal font-body mt-1">
                            The unexpected release has sent fans into a frenzy.
                          </p>
                        </div>
                        <div
                          className="w-1/3 bg-center bg-no-repeat aspect-square bg-cover"
                          style={{
                            backgroundImage:
                              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBHOY5JapD4xg3a_lVru82Rsrdx0jrh6WJhifmXK7RU5ZPYu7g9KdEgT-JAe4f_Ncc3tncTOxJnQG3U2AL5d1ut8RiJZkBlEnFkMY_-CGMpZqSK9b6ryjw-M2sDUesC-1_neEywqwx3ST4fLch-oDw67kw48zsHxUMpAnjhjptGU-2CXquCRSUR2Vh-THwcf6dXPxXzZWzC-iPpHcEaUmxnm9HeOghNY_SjjXLhRvXZ7oaUJiTpNIF8IaB0In-I6P3QHEKq-FPyTnac")',
                            filter: 'brightness(1.1)',
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Opinion Section */}
              <div className="border-t-2 border-neutral-300 dark:border-neutral-700 pt-12 mt-12 mb-12">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-primary dark:text-neutral-50 text-2xl font-black font-body leading-tight tracking-tight pb-2 border-b-4 border-black dark:border-white inline-block">
                    Opinion
                  </h2>
                  <Link href="/section/opinion" className="text-blue-600 hover:underline text-sm font-sans font-semibold">
                    See All →
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                  <article className="border-r-0 md:border-r-2 border-neutral-300 dark:border-neutral-700 md:pr-8 hover:bg-neutral-50 dark:hover:bg-neutral-900 p-4 -mx-4 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-sans font-bold text-purple-600 uppercase tracking-wider">
                        Editorial
                      </span>
                    </div>
                    <h3 className="text-primary dark:text-neutral-50 text-xl font-bold font-body leading-tight hover:underline mb-3">
                      The Case for a Four-Day Work Week
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-base font-body leading-relaxed mb-3">
                      Increased productivity and employee well-being make it a win-win. Companies that have implemented shorter work weeks report better outcomes across the board.
                    </p>
                    <Link href="/author/sarah-mitchell" className="text-sm font-sans text-neutral-500 hover:underline">
                      By Sarah Mitchell
                    </Link>
                  </article>
                  <article className="border-r-0 md:border-r-2 border-neutral-300 dark:border-neutral-700 md:pr-8 hover:bg-neutral-50 dark:hover:bg-neutral-900 p-4 -mx-4 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-sans font-bold text-purple-600 uppercase tracking-wider">
                        Op-Ed
                      </span>
                    </div>
                    <h3 className="text-primary dark:text-neutral-50 text-xl font-bold font-body leading-tight hover:underline mb-3">
                      Is Social Media Eroding Public Discourse?
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-base font-body leading-relaxed mb-3">
                      A critical look at the impact of online platforms on our society and the quality of democratic debate in the digital age.
                    </p>
                    <Link href="/author/james-chen" className="text-sm font-sans text-neutral-500 hover:underline">
                      By James Chen
                    </Link>
                  </article>
                  <article className="hover:bg-neutral-50 dark:hover:bg-neutral-900 p-4 -mx-4 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-sans font-bold text-purple-600 uppercase tracking-wider">
                        Column
                      </span>
                    </div>
                    <h3 className="text-primary dark:text-neutral-50 text-xl font-bold font-body leading-tight hover:underline mb-3">
                      Climate Action Cannot Wait
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-base font-body leading-relaxed mb-3">
                      The urgency of environmental policy reform has never been clearer as extreme weather events become the new normal.
                    </p>
                    <Link href="/author/maria-rodriguez" className="text-sm font-sans text-neutral-500 hover:underline">
                      By Maria Rodriguez
                    </Link>
                  </article>
                </div>
              </div>

              {/* Weather Section */}
              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-8 mt-8">
                <h2 className="text-primary dark:text-neutral-50 text-xl font-bold font-body leading-tight tracking-[-0.015em] px-0 pb-3 border-b border-black dark:border-white">
                  Weather
                </h2>
                <div className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-x divide-neutral-200 dark:divide-neutral-700">
                    <div className="flex flex-col items-center gap-1">
                      <p className="font-bold font-sans text-base">Today</p>
                      <span className="material-symbols-outlined text-3xl text-yellow-500">
                        sunny
                      </span>
                      <p className="text-lg font-sans">75°F</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 font-sans">
                        Sunny
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <p className="font-bold font-sans text-base">Tomorrow</p>
                      <span className="material-symbols-outlined text-3xl text-neutral-400">
                        cloud
                      </span>
                      <p className="text-lg font-sans">72°F</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 font-sans">
                        Cloudy
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <p className="font-bold font-sans text-base">Friday</p>
                      <span className="material-symbols-outlined text-3xl text-blue-400">
                        rainy
                      </span>
                      <p className="text-lg font-sans">68°F</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 font-sans">
                        Showers
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <p className="font-bold font-sans text-base">Saturday</p>
                      <span className="material-symbols-outlined text-3xl text-yellow-500">
                        partly_cloudy_day
                      </span>
                      <p className="text-lg font-sans">73°F</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 font-sans">
                        Partly Cloudy
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </main>

            <Footer />
          </div>
        </div>
      </div>
    </div>
  )
}
