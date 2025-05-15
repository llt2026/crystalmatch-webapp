export const dynamic = 'force-dynamic';

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TermsPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 to-black p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Terms of Service</h1>
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
              Welcome to CrystalMatch ("we," "our," or "the Service"). Please read the following terms and conditions carefully as they govern your access to and use of our website and services.
              By accessing or using the CrystalMatch service, you agree to be bound by these Terms of Service. If you do not agree to any part of these terms, you must not access or use our services.
            </p>

            <h2 className="text-xl font-semibold text-white mt-6 mb-4">2. Account Registration</h2>
            <p className="text-gray-200">
              To use certain features, you may need to register for an account. You agree to provide accurate, complete, and up-to-date registration information. You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.
              We reserve the right to refuse service, terminate accounts, or modify/remove content at our sole discretion when we deem it necessary.
            </p>

            <h2 className="text-xl font-semibold text-white mt-6 mb-4">3. User Content</h2>
            <p className="text-gray-200">
              Our service allows you to submit, link, store, share, and provide certain information, text, graphics, or other materials. Your ownership in your content remains, but by submitting content to us, you grant us a worldwide, non-exclusive, royalty-free license.
              You are solely responsible for any user content you provide and represent that you have all rights necessary to submit such content.
            </p>

            <h2 className="text-xl font-semibold text-white mt-6 mb-4">4. Subscriptions and Payments</h2>
            <p className="text-gray-200">
              Some features of the service may require a subscription. You agree to pay all fees according to the subscription type you select. Subscriptions will automatically renew unless canceled. Subscriptions are billed on a monthly or yearly basis, depending on the subscription type you choose.
              All payments are non-refundable unless required by law or as otherwise specified in these terms.
            </p>

            <h2 className="text-xl font-semibold text-white mt-6 mb-4">5. Service Modifications</h2>
            <p className="text-gray-200">
              We reserve the right to modify or terminate the service at any time, with or without prior notice. We shall not be liable for any such modifications, price changes, suspension, or discontinuance of the service to you or any third party.
            </p>

            <h2 className="text-xl font-semibold text-white mt-6 mb-4">6. Privacy Policy</h2>
            <p className="text-gray-200">
              Your use of our service is also governed by our <Link href="/privacy" className="text-purple-300 hover:text-purple-200">Privacy Policy</Link>. Please review our Privacy Policy to understand how we collect, use, and share your personal information.
            </p>

            <h2 className="text-xl font-semibold text-white mt-6 mb-4">7. Disclaimer</h2>
            <p className="text-gray-200">
              Our services are provided on an "as is" and "as available" basis, without any warranties of any kind. We do not guarantee that the service will be uninterrupted, timely, secure, or error-free, or that results obtained from using the service will be accurate or reliable.
            </p>

            <h2 className="text-xl font-semibold text-white mt-6 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-200">
              In no event shall we, our directors, employees, partners, or agents be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of or inability to use the service.
            </p>

            <h2 className="text-xl font-semibold text-white mt-6 mb-4">9. Governing Law</h2>
            <p className="text-gray-200">
              These terms shall be governed by the laws of United States, without regard to conflict of law principles. You agree that any action related to the service shall be brought in the courts with jurisdiction in the United States.
            </p>

            <h2 className="text-xl font-semibold text-white mt-6 mb-4">10. Changes to Terms</h2>
            <p className="text-gray-200">
              We reserve the right to modify these terms at any time. If we make material changes, we will notify you by posting the updated terms on the website or by email. Your continued use of the service will be deemed acceptance of the modified terms.
            </p>

            <h2 className="text-xl font-semibold text-white mt-6 mb-4">11. Contact Us</h2>
            <p className="text-gray-200">
              If you have any questions about these terms, please contact us at:
              <br />
              Email: support@crystalmatch.com
            </p>
          </div>
        </div>
      </div>
    </main>
  );
} 