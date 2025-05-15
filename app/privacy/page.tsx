'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 to-black p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
          <button
            onClick={() => router.back()}
            className="flex items-center text-purple-300 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </button>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300">Last Updated: December 1, 2023</p>
            
            <h2 className="text-xl font-semibold text-white mt-6 mb-4">1. Introduction</h2>
            <p className="text-gray-200">
              CrystalMatch ("we," "our," or "the App") values your privacy. This Privacy Policy is designed to explain how we collect, use, store, and protect your personal information.
              We recommend you read this Privacy Policy carefully so that you understand our privacy practices and your privacy choices.
            </p>

            <h2 className="text-xl font-semibold text-white mt-6 mb-4">2. Information We Collect</h2>
            <p className="text-gray-200">
              <strong>Personal Information:</strong> When you register for an account, use our services, or contact us, we may collect certain personal information, such as:
            </p>
            <ul className="list-disc list-inside text-gray-200 ml-6 mb-4">
              <li>Contact information (e.g., email address)</li>
              <li>Date and time of birth (for energy matching analysis)</li>
              <li>Account credentials</li>
              <li>Payment information (processed through secure third-party payment processors)</li>
              <li>Your usage preferences and settings</li>
            </ul>
            
            <p className="text-gray-200">
              <strong>Automatically Collected Information:</strong> When you use our services, we may automatically collect certain information, such as:
            </p>
            <ul className="list-disc list-inside text-gray-200 ml-6 mb-4">
              <li>Device information (e.g., device type, operating system)</li>
              <li>IP address and geolocation data</li>
              <li>Browser type and settings</li>
              <li>Data collected through cookies and similar technologies</li>
              <li>Usage data (e.g., usage patterns and interactions)</li>
            </ul>

            <h2 className="text-xl font-semibold text-white mt-6 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-200">
              We use the information we collect for the following purposes:
            </p>
            <ul className="list-disc list-inside text-gray-200 ml-6 mb-4">
              <li>To provide, maintain, and improve our services</li>
              <li>To process and complete transactions</li>
              <li>To send service-related notices and updates</li>
              <li>To respond to your requests and inquiries</li>
              <li>To personalize your experience based on your preferences</li>
              <li>To analyze and understand user behavior to improve our services</li>
              <li>To prevent fraud and enhance security</li>
              <li>To comply with legal obligations</li>
            </ul>

            <h2 className="text-xl font-semibold text-white mt-6 mb-4">4. Information Sharing and Disclosure</h2>
            <p className="text-gray-200">
              We do not sell, rent, or trade your personal information. We may share your information in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-200 ml-6 mb-4">
              <li>With your consent</li>
              <li>With third-party service providers who provide services (e.g., payment processors, cloud service providers)</li>
              <li>When required by law or to protect our rights</li>
              <li>In connection with a corporate transaction (e.g., merger, acquisition)</li>
            </ul>

            <h2 className="text-xl font-semibold text-white mt-6 mb-4">5. Cookies and Tracking Technologies</h2>
            <p className="text-gray-200">
              We use cookies and similar technologies to collect and store information about your interactions with our services. These technologies help us remember your preferences, analyze trends, and provide personalized experiences.
              You can refuse cookies through your browser settings, but this may affect certain features of our services.
            </p>

            <h2 className="text-xl font-semibold text-white mt-6 mb-4">6. Data Security</h2>
            <p className="text-gray-200">
              We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, use, or disclosure. However, while we strive to protect your information, no method of data transmission or storage is 100% secure.
            </p>

            <h2 className="text-xl font-semibold text-white mt-6 mb-4">7. Data Retention</h2>
            <p className="text-gray-200">
              We retain your personal information for as long as necessary to fulfill the purposes for which we collected it, unless a longer retention period is required or permitted by law.
            </p>

            <h2 className="text-xl font-semibold text-white mt-6 mb-4">8. Your Rights and Choices</h2>
            <p className="text-gray-200">
              Depending on applicable laws in your jurisdiction, you may have the following rights:
            </p>
            <ul className="list-disc list-inside text-gray-200 ml-6 mb-4">
              <li>Access, correct, or delete your personal information</li>
              <li>Restrict or object to specific processing</li>
              <li>Data portability</li>
              <li>Withdraw consent (where applicable)</li>
              <li>Lodge a complaint with a supervisory authority</li>
            </ul>
            <p className="text-gray-200">
              To exercise these rights, please contact us using the contact information below.
            </p>

            <h2 className="text-xl font-semibold text-white mt-6 mb-4">9. Children's Privacy</h2>
            <p className="text-gray-200">
              Our services are not directed to children under 16 years of age. We do not knowingly collect personal information from children under 16. If you become aware that we may have collected personal information from a child, please contact us promptly, and we will take steps to delete such information.
            </p>

            <h2 className="text-xl font-semibold text-white mt-6 mb-4">10. Changes to This Privacy Policy</h2>
            <p className="text-gray-200">
              We may update this Privacy Policy from time to time. If we make material changes, we will notify you by posting the updated policy on our website or by email. We encourage you to review this page periodically for the latest information.
            </p>

            <h2 className="text-xl font-semibold text-white mt-6 mb-4">11. Contact Us</h2>
            <p className="text-gray-200">
              If you have any questions, comments, or requests regarding this Privacy Policy or our practices, please contact us at:
              <br />
              Email: privacy@crystalmatch.com
            </p>

            <div className="mt-8 pt-6 border-t border-purple-500/20">
              <p className="text-gray-300">
                By using our services, you confirm that you have read and understood this Privacy Policy and agree to our collection, use, and processing of your information as described in this policy.
              </p>
              <p className="text-gray-300 mt-4">
                If you do not agree with any aspect of this Privacy Policy, please do not use our services.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 