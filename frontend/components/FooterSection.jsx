"use client";
import { FaFacebook, FaInstagram, FaPinterest, FaYoutube, FaTiktok } from "react-icons/fa";
import { FaThreads } from "react-icons/fa6";

export default function FooterSection() {
  const socialLinks = [
    { icon: <FaFacebook />, url: "https://www.facebook.com/share/17jxBbhJre/?mibextid=wwXIfr", label: "Facebook" },
    { icon: <FaInstagram />, url: "https://www.instagram.com/alkissanfoods", label: "Instagram" },
    { icon: <FaPinterest />, url: "https://www.pinterest.com/alkissanfoods", label: "Pinterest" },
    { icon: <FaThreads />, url: "https://www.threads.net/@alkissanfoods", label: "Threads" },
    { icon: <FaYoutube />, url: "https://youtube.com/@alkissafoods?si=1vakMX27yyUTOdwc", label: "YouTube" },
    { icon: <FaTiktok />, url: "https://www.tiktok.com/@alkissanfoods", label: "TikTok" },
  ];

  return (
    <footer className="relative mt-20 bg-gradient-to-b from-white via-green-50 to-green-100 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="relative max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Left Column - Company Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Al Kissan <span className="text-green-700">Foods</span>
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Premium quality organic foods straight from farm to your table. Certified, trusted, and loved by thousands of families across Pakistan.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Email</p>
                  <a href="mailto:akorganicsfoodpvtld@gmail.com" className="text-gray-600 hover:text-green-700 transition-colors">
                    akorganicsfoodpvtld@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Head Office</p>
                  <p className="text-gray-600">Office 305, Sector A2, Block 4, Haider Road, Township, Lahore</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Processing Unit</p>
                  <p className="text-gray-600">AK Organics Food Pvt. Ltd, Kot Shah Mushtaq, Hujra Shah Muqeem, Okara</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Social Links */}
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                Follow Us On
              </h3>
              <div className="flex flex-wrap gap-3 mb-6">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    aria-label={social.label}
                  >
                    <span className="text-2xl text-gray-700 group-hover:text-green-600 transition-colors">
                      {social.icon}
                    </span>
                  </a>
                ))}
              </div>

              {/* Quality Badges moved here */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">100% Natural</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Secure Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Centered */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">&copy; {new Date().getFullYear()} Al Kissan Foods. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
