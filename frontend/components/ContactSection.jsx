"use client";
import { useState } from "react";
import { FiUser, FiMail, FiMessageSquare, FiSend, FiCheckCircle } from "react-icons/fi";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const validateForm = () => {
    const newErrors = { name: "", email: "", subject: "", message: "" };
    let isValid = true;

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
      isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Subject validation
    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
      isValid = false;
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = "Subject must be at least 3 characters";
      isValid = false;
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
      isValid = false;
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
      isValid = false;
    } else if (formData.message.trim().length > 500) {
      newErrors.message = "Message must be less than 500 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
    // Clear submit error
    if (submitError) {
      setSubmitError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server error. Please try again later.");
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to send message");
      }

      setFormData({ name: "", email: "", subject: "", message: "" });
      setIsSubmitted(true);

      setTimeout(() => setIsSubmitted(false), 10000);
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitError(error.message || "Failed to send message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section id="contact" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-transparent">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-72 h-72 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="relative max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center gap-2 mb-4">
              <div className="h-1 w-10 bg-green-500 rounded-full"></div>
              <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">
                Get In Touch
              </span>
              <div className="h-1 w-10 bg-green-500 rounded-full"></div>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Contact <span className="text-green-700">Us</span>
            </h2>
            
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Have questions about our products or services? We're here to help.
            </p>
          </div>

          {/* Contact Form Container */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3">
              {/* Left Side - Contact Info */}
              <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white p-8 md:p-12 lg:p-16">
                <h3 className="text-2xl font-bold mb-8">Get in Touch</h3>
                
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="bg-white/20 p-3 rounded-xl">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Head Office</h4>
                      <p className="text-white/90 text-sm">Office 305, Sector A2, Block 4, Haider Road, Township, Lahore</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-white/20 p-3 rounded-xl">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Phone Number</h4>
                      <p className="text-white/90 text-sm">+923004809083</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-white/20 p-3 rounded-xl">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Email Address</h4>
                      <p className="text-white/90 text-sm">akorganicsfoodpvtltd@gmail.com</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/20">
                  <h4 className="font-semibold mb-4">Business Hours</h4>
                  <div className="space-y-2 text-sm">
                    <p className="flex justify-between"><span>Monday - Friday</span> <span>9:00 AM - 6:00 PM</span></p>
                    <p className="flex justify-between"><span>Saturday</span> <span>10:00 AM - 4:00 PM</span></p>
                    <p className="flex justify-between"><span>Sunday</span> <span>Closed</span></p>
                  </div>
                </div>
              </div>

              {/* Right Side - Form */}
              <div className="lg:col-span-2 p-8 md:p-12 lg:p-16 bg-white">
                {isSubmitted ? (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                      <FiCheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Message Sent Successfully!</h3>
                    <p className="text-gray-600 mb-4 max-w-md mx-auto">
                      Thank you for contacting Al Kissan Foods. We'll get back to you within 24 hours.
                    </p>
                    <div className="space-y-3 mb-8">
                      <p className="text-green-600 font-medium">
                        ✓ Your message has been sent to our team
                      </p>
                      {formData.email && (
                        <p className="text-green-600 font-medium">
                          ✓ A confirmation email has been sent to {formData.email}
                        </p>
                      )}
                      <p className="text-gray-500 text-sm">
                        We'll contact you at {formData.email || 'the email you provided'} soon.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Name Field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full pl-12 pr-4 py-3.5 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white text-gray-900`}
                            placeholder="Full Name"
                          />
                        </div>
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                      </div>

                      {/* Email Field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full pl-12 pr-4 py-3.5 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white text-gray-900`}
                            placeholder="Your Email"
                          />
                        </div>
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    {/* Subject Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className={`w-full px-4 py-3.5 border ${errors.subject ? 'border-red-300' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white text-gray-900`}
                        placeholder="How can we help you?"
                      />
                      {errors.subject && (
                        <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                      )}
                    </div>

                    {/* Message Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Message <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FiMessageSquare className="absolute left-4 top-4 text-gray-400" />
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          rows={5}
                          maxLength={500}
                          className={`w-full pl-12 pr-4 py-3.5 border ${errors.message ? 'border-red-300' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all resize-none bg-white text-gray-900`}
                          placeholder="Tell us about your inquiry..."
                        />
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        {errors.message ? (
                          <p className="text-sm text-red-600">{errors.message}</p>
                        ) : (
                          <p className="text-xs text-gray-500">Please include relevant details</p>
                        )}
                        <span className={`text-xs ${formData.message.length < 10 ? 'text-gray-400' : 'text-green-600'}`}>
                          {formData.message.length}/500
                        </span>
                      </div>
                    </div>

                    {/* Error Message */}
                    {submitError && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-start">
                          <svg className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.782 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <div>
                            <p className="text-red-600 text-sm font-medium mb-1">Unable to send message</p>
                            <p className="text-red-500 text-sm">{submitError}</p>
                            <p className="text-gray-600 text-xs mt-2">
                              You can also contact us directly at <strong>+923004809083</strong> or email <strong>akorganicsfoodpvtltd@gmail.com</strong>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <FiSend className="w-5 h-5" />
                          Send Message
                        </>
                      )}
                    </button>

                    <p className="text-xs text-gray-500 text-center">
                      By submitting this form, you agree to our{" "}
                      <a href="#" className="text-green-600 hover:underline">Privacy Policy</a>
                      . We respect your privacy and will not share your information.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Custom CSS for animations */}
        <style jsx>{`
          @keyframes blob {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
              transform: translate(0px, 0px) scale(1);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
      </section>
      
      {/* Add this wrapper div to ensure proper background at the bottom */}
      <div className="bg-white w-full h-0"></div>
    </>
  );
}