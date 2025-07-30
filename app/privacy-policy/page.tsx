import Head from 'next/head';
import Link from 'next/link';

const ListMarker = () => (
  <svg
    className="h-6 w-6 flex-none text-purple-600"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 00-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z"
      clipRule="evenodd"
    />
  </svg>
);

const PrivacyPolicyPage = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy - RMHSE</title>
        <meta
          name="description"
          content="Learn how RMHSE collects, uses, and protects your personal information. Your trust and privacy are our top priority."
        />
      </Head>

      <div className="bg-white px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-3xl text-base leading-7 text-gray-700">
          <p className="text-base font-semibold leading-7 text-purple-600">
            For GrowUp Platform
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-6 text-xl leading-8">
            Your trust is the foundation of our mission. This policy outlines our commitment to protecting your personal information and being transparent about how we use it.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {/* <strong>Effective Date:</strong> [Insert Date] */}
          </p>

          <div className="mt-16 space-y-12">
            
            <section>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 border-b border-gray-200 pb-4">
                1. Our Commitment to Your Privacy
              </h2>
              <p className="mt-6">
                Welcome to RMHSE! Our mission, envisioned by our founders Mr. Gaurav Prajapati and Ms. Priya Verma, is to build a better future for all Indians by providing easy, secure, and genuine work-from-home opportunities. This Privacy Policy explains how we collect, use, share, and protect your personal information when you use our website and services (collectively, our "Platform").
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 border-b border-gray-200 pb-4">
                2. Information We Collect
              </h2>
              <p className="mt-6">
                To provide you with a seamless and effective experience, we collect the following types of information.
              </p>
              <h3 className="mt-8 text-xl font-semibold tracking-tight text-gray-800">
                a) Information You Provide Directly
              </h3>
              <ul role="list" className="mt-6 space-y-4">
                <li className="flex gap-x-3">
                  <ListMarker />
                  <span>
                    <strong>Account Information:</strong> When you register, we collect your Name, Email Address, Phone Number, and a secure Password.
                  </span>
                </li>
                <li className="flex gap-x-3">
                  <ListMarker />
                  <span>
                    <strong>Profile Information:</strong> To match you with jobs, you may provide details on your Skills, Work Experience, Education, and Preferences.
                  </span>
                </li>
                <li className="flex gap-x-3">
                  <ListMarker />
                  <span>
                    <strong>Financial Information:</strong> For transparent payouts, we collect your Bank Account Details or UPI ID, used exclusively for payment processing.
                  </span>
                </li>
                <li className="flex gap-x-3">
                  <ListMarker />
                  <span>
                    <strong>Communications:</strong> We keep a record of your correspondence when you contact us for support.
                  </span>
                </li>
              </ul>
              <h3 className="mt-8 text-xl font-semibold tracking-tight text-gray-800">
                b) Information We Collect Automatically
              </h3>
              <ul role="list" className="mt-6 space-y-4">
                 <li className="flex gap-x-3">
                  <ListMarker />
                  <span><strong>Usage Data:</strong> Information on how you interact with our Platform, such as pages visited and tasks viewed.</span>
                </li>
                <li className="flex gap-x-3">
                  <ListMarker />
                  <span><strong>Device and Technical Data:</strong> Your IP Address, Browser Type, and Operating System to improve compatibility and security.</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 border-b border-gray-200 pb-4">
                3. How We Use Your Information
              </h2>
              <p className="mt-6">
                We use your information for specific, legitimate purposes, all aimed at fulfilling our promise of providing authentic work opportunities.
              </p>
              <ul role="list" className="mt-8 space-y-4">
                <li className="flex gap-x-3"><ListMarker /><span><strong>To Provide and Manage Our Services.</strong></span></li>
                <li className="flex gap-x-3"><ListMarker /><span><strong>To Match You with Opportunities.</strong></span></li>
                <li className="flex gap-x-3"><ListMarker /><span><strong>To Process Payments Securely.</strong></span></li>
                <li className="flex gap-x-3"><ListMarker /><span><strong>To Communicate With You.</strong></span></li>
                <li className="flex gap-x-3"><ListMarker /><span><strong>To Improve Our Platform.</strong></span></li>
                <li className="flex gap-x-3"><ListMarker /><span><strong>For Safety and Security.</strong></span></li>
              </ul>
            </section>
            
            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 border-b border-gray-200 pb-4">
                4. How We Share Your Information
              </h2>
              <p className="mt-6">
                Your privacy is paramount. We do not sell your personal data. We only share information in these limited circumstances:
              </p>
              <ul role="list" className="mt-8 space-y-4">
                <li className="flex gap-x-3"><ListMarker /><span><strong>With Verified Companies/Clients:</strong> We share non-identifying profile information (e.g., skills, first name) to connect you with jobs. Your contact and financial details are never shared with them.</span></li>
                <li className="flex gap-x-3"><ListMarker /><span><strong>With Service Providers:</strong> We use trusted partners for payment processing and cloud hosting who are contractually bound to protect your data.</span></li>
                <li className="flex gap-x-3"><ListMarker /><span><strong>For Legal Reasons:</strong> We may disclose information if required by law or a valid request from a public authority.</span></li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 border-b border-gray-200 pb-4">
                10. Contact Us
              </h2>
              <p className="mt-6">
                If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please do not hesitate to contact us. We are here to help.
              </p>
              <div className="mt-6">
                <p><strong>Email:</strong> <a href="mailto:officialgrowup01@gmail.com" className="text-purple-600 hover:text-purple-700 hover:underline">officialgrowup01@gmail.com</a></p>
                <p><strong>Website:</strong> <Link href="https://rmhse-fe.vercel.app/" className="text-purple-600 hover:text-purple-700 hover:underline">RMHSE</Link></p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicyPage;