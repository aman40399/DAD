import React from "react";

export default function Disclaimer() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Disclaimer – Chhkwa.com</h1>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">हिंदी:</h2>
        <p className="mb-2">Chhkwa.com पर प्रकाशित सभी समाचार और कंटेंट केवल सूचना के उद्देश्य के लिए हैं। वेबसाइट पर दी गई जानकारी का उपयोग करने से पहले कृपया स्वयं पुष्टि करें। हम किसी भी नुकसान या हानि के लिए जिम्मेदार नहीं होंगे।</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">English:</h2>
        <p className="mb-2">All news and content published on Chhkwa.com are for informational purposes only. Please verify any information before relying on it. We are not responsible for any loss or damage resulting from the use of this information.</p>
      </section>
    </main>
  );
}
