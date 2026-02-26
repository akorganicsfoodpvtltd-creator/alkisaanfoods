import Image from "next/image";
import { FaPhoneAlt, FaWhatsapp, FaQuoteLeft, FaCalendarAlt } from "react-icons/fa";
import { MdVerified, MdEmail } from "react-icons/md";

const GREEN_PRIMARY = "#22c55e"; // Tailwind emerald-500

export default function DietitianSection() {
  return (
    <div id="dietitian" className="py-16 px-4 md:px-8 lg:px-16 relative">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <div className="h-1 w-20 bg-green-500 rounded-full"></div>
            <span className="text-green-600 font-semibold text-sm uppercase tracking-widest">
              MEET OUR EXPERT TEAM
            </span>
            <div className="h-1 w-20 bg-green-500 rounded-full"></div>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Meet <span className="text-green-700">Senior Dietitian</span>
          </h2>

          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
            Learn from our certified nutrition expert who ensures healthy and balanced meal plans.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100">
          <div className="flex flex-col lg:flex-row">
            
            {/* Left Side - Profile */}
            <div className="lg:w-2/5 p-8 md:p-10 bg-gradient-to-b from-green-50/30 to-white">
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-8 border-white shadow-2xl relative">
                    <Image
                      src="/dietician.png"
                      alt="Dr. Saira Hayat"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-3 rounded-full shadow-lg">
                    <MdVerified size={24} />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-1">Dr. Saira Hayat</h3>
                <p className="text-gray-600 mb-6">M Phill in Clinical Nutrition</p>

                <div className="w-full max-w-xs space-y-4">
                 <a
  href="tel:03124282909"
  className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
  style={{ backgroundColor: "rgba(23, 47, 132, 0.89)" }} // ✅ string, not function
>
  <FaPhoneAlt />
  <span>Call: 0312-4282909</span>
</a>


                  <a
                    href="https://wa.me/923124282909"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    <FaWhatsapp size={20} />
                    <span>WhatsApp Chat</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Side - Content */}
            <div className="lg:w-3/5 p-8 md:p-10 flex flex-col justify-center">
              
              {/* Testimonial */}
              <div className="bg-gradient-to-r from-green-50/50 to-green-100 rounded-xl p-6 border-l-4 mb-8" style={{ borderLeftColor: GREEN_PRIMARY }}>
                <div className="flex items-start gap-4">
                  <FaQuoteLeft className="text-2xl flex-shrink-0" style={{ color: GREEN_PRIMARY }} />
                  <div>
                  <p className="text-gray-700 text-lg mb-4 text-justify">
  "With over 15 years of experience, I recommend Al Kissan Multigrain Flour for diabetic patients, weight management, and overall wellness. Packed with essential nutrients and gluten-friendly, it ensures purity and consistency for healthy meal planning."
</p>


                    <div>
                      <p className="font-semibold text-gray-800">Dr. Saira Hayat</p>
                      <p className="text-sm text-gray-600">Senior Dietitian & Nutrition Expert</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="flex flex-wrap gap-6 text-gray-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${GREEN_PRIMARY}20` }}>
                    <MdEmail style={{ color: GREEN_PRIMARY }} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">sairahayat787@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100">
                    <FaCalendarAlt className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Availability</p>
                    <p className="font-medium">Mon-Sat, 10AM - 6PM</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
