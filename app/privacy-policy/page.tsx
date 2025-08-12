import { ShieldCheck, Mail, Phone, MapPin, Globe } from 'lucide-react';

// You can create a Layout component if you have a standard header/footer
// For this example, we'll make it a self-contained page.

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="p-8 sm:p-12">
            {/* Header Section */}
            <div className="text-center mb-12">
              <ShieldCheck className="mx-auto h-16 w-16 text-green-600 mb-4" />
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">
                Privacy Policy
              </h1>
              <p className="mt-4 text-lg text-gray-500">
                Effective Date: August 1, 2025
              </p>
            </div>

            {/* Introduction */}
            <p className="text-lg leading-relaxed text-gray-600 mb-8">
              RMHSE Trust (“we,” “our,” or “us”) is committed to protecting your privacy and ensuring transparency in how we collect, use, and safeguard your information. This Privacy Policy explains how we handle the personal data of our members, donors, and visitors when you interact with our website, mobile application, and services.
            </p>

            {/* Policy Sections */}
            <div className="space-y-10">
              
              {/* Section 1: Information We Collect */}
              <div>
                <h2 className="text-2xl font-bold text-gray-700 border-l-4 border-green-500 pl-4 mb-4">
                  1. Information We Collect
                </h2>
                <p className="text-gray-600 mb-4">We may collect the following types of information:</p>
                <div className="space-y-3 pl-5 text-gray-700">
                  <p><strong>a. Personal Information You Provide:</strong> Name, contact number, email address, postal address and identification details (e.g., Aadhaar for verification purposes), payment and donation details, and volunteering or membership information.</p>
                  <p><strong>b. Automatically Collected Information:</strong> Device and browser information, IP address and location data, and website usage statistics and analytics.</p>
                  <p><strong>c. Donation & Service Tracking Information:</strong> Records of your contributions and participation in our initiatives, and tracking details for donations as part of our “Donate, Track & Decide Digitally” system.</p>
                </div>
              </div>

              {/* Section 2: How We Use Your Information */}
              <div>
                <h2 className="text-2xl font-bold text-gray-700 border-l-4 border-green-500 pl-4 mb-4">
                  2. How We Use Your Information
                </h2>
                <p className="text-gray-600 mb-4">We use your personal data for the following purposes:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>To process donations and issue receipts.</li>
                  <li>To keep you updated about RMHSE Trust activities, campaigns, and events.</li>
                  <li>To enable you to participate in our programs and volunteer work.</li>
                  <li>To maintain accurate records for compliance with government regulations (including 80G and 12A registrations).</li>
                  <li>To improve our services through feedback and analytics.</li>
                  <li>To ensure transparency and accountability in our donation tracking system.</li>
                </ul>
              </div>

              {/* Section 3: Sharing of Information */}
              <div>
                <h2 className="text-2xl font-bold text-gray-700 border-l-4 border-green-500 pl-4 mb-4">
                  3. Sharing of Information
                </h2>
                <p className="text-gray-600 mb-4">We do not sell or rent your personal information. However, we may share your information with:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Government authorities when required by law for compliance and reporting.</li>
                    <li>Trusted third-party service providers for payment processing, communication, and IT support.</li>
                    <li>Other members or volunteers (only with your consent) for collaborative projects.</li>
                </ul>
              </div>

              {/* Section 4: Data Security */}
              <div>
                <h2 className="text-2xl font-bold text-gray-700 border-l-4 border-green-500 pl-4 mb-4">
                  4. Data Security
                </h2>
                 <p className="text-gray-600 mb-4">We implement strong security measures to protect your information:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Encrypted payment transactions.</li>
                    <li>Secure servers and restricted database access.</li>
                    <li>Regular audits and monitoring of our digital platforms.</li>
                </ul>
                 <p className="mt-4 text-sm text-gray-500">However, no online platform can guarantee 100% security. While we strive to protect your data, you use our services at your own risk.</p>
              </div>

              {/* Section 5: Your Rights */}
              <div>
                <h2 className="text-2xl font-bold text-gray-700 border-l-4 border-green-500 pl-4 mb-4">
                  5. Your Rights
                </h2>
                <p className="text-gray-600 mb-4">You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Access and review your personal data.</li>
                    <li>Request corrections or updates to your data.</li>
                    <li>Withdraw consent for communication.</li>
                    <li>Request deletion of your personal data (subject to legal and regulatory requirements).</li>
                </ul>
                <p className="mt-4 text-gray-600">For any such requests, contact us at <a href="mailto:support@rmhse.org" className="text-green-600 font-medium hover:underline">support@rmhse.org</a> or <a href="tel:+917210050984" className="text-green-600 font-medium hover:underline">+91-72100 50984</a>.</p>
              </div>
              
              {/* Other Sections */}
              <div><h2 className="text-2xl font-bold text-gray-700 border-l-4 border-green-500 pl-4 mb-4">6. Cookies & Tracking</h2><p className="text-gray-700">Our website may use cookies and similar tracking technologies to improve your browsing experience, store preferences, and analyze website traffic. You can disable cookies through your browser settings, but some features may not work properly.</p></div>
              <div><h2 className="text-2xl font-bold text-gray-700 border-l-4 border-green-500 pl-4 mb-4">7. Third-Party Links</h2><p className="text-gray-700">Our website and app may contain links to third-party websites. RMHSE Trust is not responsible for the privacy practices of these external sites. We encourage you to read their privacy policies.</p></div>
              <div><h2 className="text-2xl font-bold text-gray-700 border-l-4 border-green-500 pl-4 mb-4">8. Policy Updates</h2><p className="text-gray-700">We may update this Privacy Policy from time to time to reflect changes in our practices or legal obligations. The latest version will always be available on our website.</p></div>

              {/* Contact Us Section */}
              <div>
                <h2 className="text-2xl font-bold text-gray-700 border-l-4 border-green-500 pl-4 mb-4">
                  9. Contact Us
                </h2>
                <p className="text-gray-600 mb-4">If you have any questions about this Privacy Policy or our data practices, please contact:</p>
                <div className="mt-4 space-y-3 text-gray-700">
                  <p className="font-semibold text-lg">RMHSE Trust</p>
                  {/* <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 mt-1 text-gray-400 shrink-0" />
                    <span>[Insert Your Full Address Here], India</span>
                  </div> */}
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400 shrink-0" />
                    <a href="mailto:support@rmhse.org" className="text-green-600 hover:underline">support@rmhse.org</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400 shrink-0" />
                    <a href="tel:+917210050984" className="text-green-600 hover:underline">+91 7210050984</a>
                  </div>
                   <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-gray-400 shrink-0" />
                    <a href="https://www.rmhse.org" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">www.rmhse.org</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Motto Section */}
            <div className="mt-16 pt-8 border-t text-center">
              <p className="text-xl font-semibold text-gray-800 italic">
                “हमारा देश, हमारा संकल्प — मिलकर बदलेंगे देश की तस्वीर”
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}