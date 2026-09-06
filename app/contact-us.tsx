import React from "react";

export default function ContactUs() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Contact Us – Chhkwa.com</h1>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">हिंदी:</h2>
        <p className="mb-2">हमसे संपर्क करने के लिए नीचे दी गई जानकारी का उपयोग करें:</p>
        <p className="mb-2">ईमेल: <a href="mailto:dhananjay.singh1975@gmail.com" className="text-blue-600 underline">dhananjay.singh1975@gmail.com</a></p>
        <p className="mb-2">फ़ोन: <a href="tel:7053750080" className="text-blue-600 underline">7053750080</a></p>
        <p>आप हमें सुझाव, प्रश्न या किसी भी प्रकार की जानकारी के लिए लिख सकते हैं।</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">English:</h2>
        <p className="mb-2">You can contact us using the following information:</p>
        <p className="mb-2">Email: <a href="mailto:dhananjay.singh1975@gmail.com" className="text-blue-600 underline">dhananjay.singh1975@gmail.com</a></p>
        <p className="mb-2">Phone: <a href="tel:7053750080" className="text-blue-600 underline">7053750080</a></p>
        <p>Feel free to send us suggestions, queries, or any information requests.</p>
      </section>
    </main>
  );
}
