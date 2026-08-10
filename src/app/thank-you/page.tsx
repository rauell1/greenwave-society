import Link from "next/link";
import { CheckCircle } from "lucide-react";

export const metadata = {
  title: "Thank You | Greenwave Society",
  description: "Thank you for reaching out to Greenwave Society.",
};

export default function ThankYouPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-20 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-8 h-8" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Thank You!
        </h1>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          We have successfully received your submission. Our team will review it and get back to you within 24 hours. We appreciate your interest in joining our mission to empower youth and conserve the environment.
        </p>

        <div className="flex flex-col gap-3">
          <Link 
            href="/"
            className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
          >
            Return to Homepage
          </Link>
          <Link 
            href="/about"
            className="w-full inline-flex justify-center items-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Learn More About Us
          </Link>
        </div>
      </div>
    </div>
  );
}
