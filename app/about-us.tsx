import React from "react";

export default function AboutUs() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">About Us – Chhkwa.com</h1>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">हिंदी:</h2>
        <p className="mb-2">Chhkwa.com एक स्वतंत्र न्यूज़ प्लेटफ़ॉर्म है जो विश्व समाचार और हाई-वैल्यु कंटेंट दोनों भाषाओं (हिंदी और अंग्रेज़ी) में प्रदान करता है। हमारा उद्देश्य पाठकों को ताज़ा, सही और भरोसेमंद जानकारी देना है।</p>
        <p className="mb-2">हमारी टीम समाचार, टेक्नोलॉजी, बिज़नेस और अन्य महत्वपूर्ण क्षेत्रों में गहन शोध करती है और उसे आपके सामने प्रस्तुत करती है।</p>
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">English:</h2>
        <p className="mb-2">Chhkwa.com is an independent news platform delivering world news and high-value content in both Hindi and English. Our goal is to provide readers with fresh, accurate, and reliable information.</p>
        <p className="mb-2">Our team researches thoroughly across news, technology, business, and other key areas, presenting it to you in an easy-to-understand manner.</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Contact</h2>
        <p className="mb-2">Email: <a href="mailto:dhananjay.singh1975@gmail.com" className="text-blue-600 underline">dhananjay.singh1975@gmail.com</a></p>
        <p>Phone: <a href="tel:7053750080" className="text-blue-600 underline">7053750080</a></p>
      </section>
    </main>
  );
}
