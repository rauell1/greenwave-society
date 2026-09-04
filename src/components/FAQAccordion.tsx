"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    question: "What is Greenwave Society?",
    answer: "Greenwave Society is a youth-led organisation based in Nairobi, Kenya. We equip young people aged 15-35 to lead, build, and connect by closing the gaps in skills, opportunity, and wellbeing through enterprise training, environmental action, and community-led programmes.",
  },
  {
    question: "Who can join Greenwave Society?",
    answer: "Greenwave Society is open to youth aged 15-35 in Kenya who are passionate about leadership, community development, environmental conservation, skills building, and social enterprise.",
  },
  {
    question: "What is The 50 Percent programme?",
    answer: "The 50 Percent is our flagship social enterprise training programme. It addresses youth unemployment and skills mismatch by expanding thinking and adding value to organisations and communities through five training pillars.",
  },
  {
    question: "How can I volunteer with Greenwave Society?",
    answer: "You can apply to volunteer by filling out our membership application form at greenwavesociety.org/join, or by contacting us via our website's contact form.",
  },
  {
    question: "How does Greenwave Society address mental health?",
    answer: "Through the Youth Pulse Program and our Community-Led Wellbeing pillar, we integrate mental health awareness and peer support into all our community programmes, recognising it as a core part of youth development.",
  }
];

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Frequently Asked Questions</h2>
      {FAQS.map((faq, index) => (
        <div 
          key={index}
          className="border border-gray-200 rounded-lg bg-white overflow-hidden"
        >
          <button
            onClick={() => toggleAccordion(index)}
            className="w-full px-6 py-4 flex justify-between items-center bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-inset transition-colors"
            aria-expanded={openIndex === index}
          >
            <span className="font-semibold text-left text-gray-900">{faq.question}</span>
            <ChevronDown 
              className={`w-5 h-5 text-emerald-600 transition-transform duration-300 ${
                openIndex === index ? "rotate-180" : ""
              }`} 
            />
          </button>
          
          <div 
            className={`transition-all duration-300 ease-in-out ${
              openIndex === index ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
            } overflow-hidden`}
          >
            <div className="px-6 py-4 text-gray-600 bg-emerald-50/30 border-t border-gray-100">
              {faq.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
