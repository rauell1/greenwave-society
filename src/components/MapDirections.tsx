"use client";

import { MapPin, Navigation } from "lucide-react";

export function MapDirections() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          <div className="order-2 lg:order-1 rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-[400px] sm:h-[500px] w-full relative">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15955.334757134376!2d36.81667!3d-1.28333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10d715b9a8f5%3A0x6b8bc92c686cd87!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Greenwave Society Location"
            ></iframe>
          </div>

          <div className="order-1 lg:order-2 space-y-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-serif font-black text-gray-900 mb-4">
                Visit Our Headquarters
              </h2>
              <p className="text-lg text-gray-600">
                We are located in the heart of Nairobi, Kenya. Feel free to drop by to learn more about our environmental initiatives and how you can get involved.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-emerald-50 text-emerald-600 p-3 rounded-full">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Address</h3>
                  <p className="text-gray-600 mt-1 leading-relaxed">
                    Greenwave Society<br />
                    CBD, Nairobi<br />
                    Kenya
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 bg-emerald-50 text-emerald-600 p-3 rounded-full">
                  <Navigation className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Directions</h3>
                  <p className="text-gray-600 mt-1 leading-relaxed">
                    Our office is accessible via public transit. If you are taking a matatu into the CBD, alight at the main terminus and walk 5 minutes north. Street parking is available nearby for those driving.
                  </p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => window.open('https://maps.google.com/?q=Nairobi,Kenya', '_blank')}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
            >
              Get Directions in Google Maps
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
