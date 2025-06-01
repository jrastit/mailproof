import { Page } from '@/components/PageLayout';

import React, { useEffect, useState } from 'react';

export default function Home() {
  const year = new Date().getFullYear();

  return (
    <Page className="">
      <div className="min-h-screen bg-[#F9EED8] text-gray-800 px-4 sm:px-6 py-10" style={{ paddingTop: 120 }}>
        {/* Slogan */}
        <h1 className="text-2xl sm:text-3xl font-semibold italic text-center my-6">
          Kill <span className="text-[#273654]">the phish</span>. <span className="text-[#3A7A61]">Keep the proof.</span>
        </h1>

        <main className="max-w-4xl mx-auto">
          {/* Features */}
          <section id="features" className="scroll-mt-32 mb-16 p-6 bg-[#F7EED6] rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 text-lg">
            <h2 className="text-2xl font-semibold text-[#263755] mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              <span className="ml-2">Received a suspicious email?</span>
            </h2>
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
              <div className="w-full md:w-1/2 flex justify-center">
                <img src="/images/Fetures.jpg" alt="MailProof Analysis Process" className="rounded-lg shadow-md max-w-xs md:max-w-sm w-full" />
              </div>
              <div className="w-full md:w-1/2">
                <p className="mb-4 text-gray-700">
                  Forward it to <strong className="text-blue-600">check@mailproof.net</strong>. Our AI agent will analyze:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700">
                  <li className="text-[#3A7A61]">Authentication (DKIM/DMARC/SPF)</li>
                  <li className="text-[#3A7A61]">Domain reputation &amp; history</li>
                  <li className="text-[#3A7A61]">Content (links, structure, keywords)</li>
                  <li className="text-[#3A7A61]">Attachments (antivirus scan, signatures)</li>
                </ul>
                <p className="text-gray-700 font-medium">
                  You’ll get a trust report via email <span className="text-green-500">✅</span> <span className="text-yellow-500">⚠️</span> <span className="text-red-500">❌</span>
                </p>
              </div>
            </div>
          </section>

          {/* File Share */}
          <section id="fileshare" className="scroll-mt-32 mb-16 p-6 bg-[#F7EED6] rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 text-lg">
            <h2 className="text-2xl font-semibold text-[#263755] mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <span className="ml-2">Want to share a file?</span>
            </h2>
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
              <div className="w-full md:w-1/2">
                <p className="mb-4 text-gray-700">
                  Send a file to <strong className="text-blue-600">file@mailproof.net</strong>. You will receive:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700">
                  <li className="text-[#3A7A61]">A unique hash of the file</li>
                  <li className="text-[#3A7A61]">A clickable certification link</li>
                  <li className="text-[#3A7A61]">A deposit proof linked to your email</li>
                </ul>
              </div>
              <div className="w-full md:w-1/2 flex justify-center">
                <img src="/images/Sent_File.jpg" alt="MailProof File Sharing Process" className="rounded-lg shadow-md max-w-xs md:max-w-sm w-full" />
              </div>
            </div>
          </section>

          {/* Certification */}
          <section id="certification" className="scroll-mt-32 mb-16 p-6 bg-[#F7EED6] rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 text-lg">
            <h2 className="text-2xl font-semibold text-[#263755] mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4"/>
                <path d="M2 20c0-4 8-6 10-6s10 2 10 6"/>
              </svg>
              <span className="ml-2">Proactive certification</span>
            </h2>
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
              <div className="w-full md:w-1/2 flex justify-center">
                <img src="/images/Certification1.jpg" alt="MailProof Proactive Certification Process" className="rounded-lg shadow-md max-w-xs md:max-w-sm w-full" />
              </div>
              <div className="w-full md:w-1/2">
                <p className="text-gray-700">
                  Certify your emails and files before sending. Get a proactive proof of integrity and timestamp, ready to show in case of dispute or audit.
                </p>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section id="pricing" className="scroll-mt-32 mb-16 p-6 bg-[#F7EED6] rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 text-lg">
            <h2 className="text-2xl font-semibold text-[#263755] mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
              <span className="ml-2">Simple payment model</span>
            </h2>
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
              <div className="w-full md:w-1/2">
                <p className="mb-4 text-gray-700">
                  On your first send to any <strong className="text-blue-600">@mailproof.net</strong> address, you’ll receive a payment link:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li className="text-[#3A7A61]">Pay-per-use</li>
                  <li className="text-[#3A7A61]">Monthly subscription</li>
                  <li className="text-[#3A7A61]">Crypto or fiat</li>
                </ul>
                <p className="mt-4 text-gray-700">Once paid, your request is processed automatically.</p>
              </div>
              <div className="w-full md:w-1/2 flex justify-center">
                <img src="/images/payment.jpg" alt="MailProof Payment Options" className="rounded-lg shadow-md max-w-xs md:max-w-sm w-full" />
              </div>
            </div>
          </section>

          {/* Contact */}
          <div id="contact" className="flex flex-col items-center justify-center my-8">
            <div className="flex items-center gap-8">
              <img src="/images/MailProof.png" alt="Forward Icon" className="h-64 w-auto" />
              <button className="bg-[#3A7A61] text-white px-6 py-3 rounded-lg font-semibold text-lg hover:bg-[#2e5c48] transition-colors">
                Forward an email now
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-20 pt-10 border-t border-gray-400 text-center text-sm text-gray-600">
          <p className="mb-2">Partners:</p>
          <p className="mt-6">&copy; {year} MAIL Proof. All rights reserved.</p>
          <p className="mt-6">&copy; {new Date().getFullYear()} MAIL Proof. All rights reserved.</p>
        </footer>
      </div>
    </Page>
  );
}
