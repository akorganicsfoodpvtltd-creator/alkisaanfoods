"use client";
import { useState, useEffect } from "react";
import {
  FaFacebook,
  FaInstagram,
  FaPinterest,
  FaThreads,
  FaYoutube,
  FaTiktok,
  FaSnapchat
} from "react-icons/fa6";
import { SiGooglemaps } from "react-icons/si";

export default function TopHeader() {

  const messages = [
    "Welcome to Al Kissan Foods Store",
    "Order Now & Live Natural",
    "Al Kissan Gluten Free Flour",
    "Al Kissan Multigrain Flour",
    "Al Kissan Barley Flour"
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[rgba(23,47,132,0.89)] text-white py-2 px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between relative">

      {/* Left Social Icons */}
      <div className="hidden sm:flex gap-4 text-xl z-10">

        <a href="https://www.facebook.com/share/17jxBbhJre/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">
          <FaFacebook />
        </a>

        <a href="https://www.instagram.com/alkissanfoods" target="_blank" rel="noopener noreferrer">
          <FaInstagram />
        </a>

        <a href="https://www.pinterest.com/alkissanfoods" target="_blank" rel="noopener noreferrer">
          <FaPinterest />
        </a>

        {/* Threads */}
        <a
          href="https://www.threads.com/@alkissanfoods"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaThreads />
        </a>

        {/* Snapchat */}
        <a
          href="https://www.snapchat.com/@alkissanfoods?invite_id=ueoo-uX4&locale=en_PK"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaSnapchat />
        </a>

        <a href="https://www.tiktok.com/@alkissanfoods" target="_blank" rel="noopener noreferrer">
          <FaTiktok />
        </a>

        <a href="https://youtube.com/@alkissafoods?si=1vakMX27yyUTOdwc" target="_blank" rel="noopener noreferrer">
          <FaYoutube />
        </a>

        <a href="https://share.google/chcGyQbec5ytFa7gh" target="_blank" rel="noopener noreferrer">
          <SiGooglemaps />
        </a>

      </div>

      {/* Center Text */}
      <div className="text-center w-full sm:absolute sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 pointer-events-none">
        <span className="text-sm sm:text-base font-semibold">
          &lt; {messages[index]} &gt;
        </span>
      </div>

      {/* Right Dummy Balance */}
      <div className="opacity-0 hidden sm:block">icons</div>

    </div>
  );
}
