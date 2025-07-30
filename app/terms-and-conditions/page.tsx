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

const TermsAndConditionsPage = () => {
  return (
    <>
      <Head>
        <title>Terms and Conditions - RMHSE</title>
        <meta
          name="description"
          content="Review the Terms and Conditions for using the RMHSE platform. Understand your rights and responsibilities as a user."
        />
      </Head>

      <div className="bg-white px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-3xl text-base leading-7 text-gray-700">
          <p className="text-base font-semibold leading-7 text-purple-600">
            Rules of Engagement
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Terms and Conditions
          </h1>
          <p className="mt-6 text-xl leading-8">
            Welcome to RMHSE. These Terms and Conditions ("Terms") govern your use of our website and services. By accessing or using our Platform, you agree to be bound by these Terms and our Privacy Policy.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {/* <strong>Effective Date:</strong> [Insert Date] */}
          </p>

          <div className="mt-16 space-y-12">

            <section>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 border-b border-gray-200 pb-4">
                1. Description of Service
              </h2>
              <p className="mt-6">
                RMHSE ("we," "us," or "our") provides an online platform that connects individuals ("Users," "you," "your") with genuine, verified work-from-home tasks and opportunities ("Work," "Tasks") offered by third-party companies ("Clients"). Our role is to act as a facilitator, creating an ecosystem that matches skills with meaningful work.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 border-b border-gray-200 pb-4">
                2. User Eligibility and Accounts
              </h2>
              <ul role="list" className="mt-6 space-y-4">
                <li className="flex gap-x-3">
                  <ListMarker />
                  <span><strong>Eligibility:</strong> You must be at least 18 years of age and a resident of India to create an account and use our Platform.</span>
                </li>
                <li className="flex gap-x-3">
                  <ListMarker />
                  <span><strong>Account Accuracy:</strong> You agree to provide true, accurate, and complete information during registration and to keep this information updated.</span>
                </li>
                <li className="flex gap-x-3">
                  <ListMarker />
                  <span><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your account password and for all activities that occur under your account. You must notify us immediately of any unauthorized use.</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 border-b border-gray-200 pb-4">
                3. The "No Investment" Policy
              </h2>
              <p className="mt-6">
                Our platform is founded on the principle that you should never have to pay to work.
              </p>
              <ul role="list" className="mt-8 space-y-4">
                <li className="flex gap-x-3"><ListMarker /><span>We will <strong>never</strong> demand registration fees, membership costs, or any form of payment from you to access work opportunities.</span></li>
                <li className="flex gap-x-3"><ListMarker /><span>Your ability, skill, and time are your only investment. We provide the opportunity; you provide the talent.</span></li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 border-b border-gray-200 pb-4">
                4. User Conduct and Responsibilities
              </h2>
              <p className="mt-6">
                As a user of RMHSE, you agree to:
              </p>
              <ul role="list" className="mt-8 space-y-4">
                <li className="flex gap-x-3"><ListMarker /><span>Perform all Tasks diligently and to the best of your ability, following any instructions provided by the Client.</span></li>
                <li className="flex gap-x-3"><ListMarker /><span>Not use bots, automated scripts, or any fraudulent means to complete Work or inflate your performance.</span></li>
                <li className="flex gap-x-3"><ListMarker /><span>Maintain professional and respectful communication with our support team and any affiliated parties.</span></li>
                <li className="flex gap-x-3"><ListMarker /><span>Not share, distribute, or reproduce any confidential information related to the Tasks or Clients.</span></li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 border-b border-gray-200 pb-4">
                5. Payment Terms
              </h2>
              <p className="mt-6">
                Our payment system is designed to be transparent and reliable.
              </p>
              <ul role="list" className="mt-8 space-y-4">
                <li className="flex gap-x-3"><ListMarker /><span><strong>Earnings:</strong> You will be paid based on the completion and verification of Tasks according to the rates specified for each Task.</span></li>
                <li className="flex gap-x-3"><ListMarker /><span><strong>Payment Processing:</strong> Payments are processed to your designated bank account or UPI ID after your completed Work has been approved and has cleared the standard processing period.</span></li>
                <li className="flex gap-x-3"><ListMarker /><span><strong>Disputes:</strong> Any disputes regarding payments must be raised with our support team within a reasonable timeframe. We will investigate all legitimate claims in good faith.</span></li>
                <li className="flex gap-x-3"><ListMarker /><span><strong>Taxes:</strong> You are solely responsible for all taxes and other governmental fees associated with the income you earn through our Platform.</span></li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 border-b border-gray-200 pb-4">
                6. Nature of Relationship
              </h2>
              <p className="mt-6">
                This is a critical distinction. By using our Platform, you acknowledge and agree that you are an <strong>independent contractor</strong>, not an employee, agent, partner, or joint venturer of RMHSE or its Clients. You are not eligible for any employee benefits, and you are responsible for your own tools, equipment, and work environment.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 border-b border-gray-200 pb-4">
                7. Termination
              </h2>
              <p className="mt-6">
                We reserve the right to suspend or terminate your account at our sole discretion, without notice, for any conduct that we believe violates these Terms, is harmful to other users or our business interests, or for any other reason.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 border-b border-gray-200 pb-4">
                8. Disclaimer of Warranties & Limitation of Liability
              </h2>
              <p className="mt-6">
                The Platform is provided on an "as-is" and "as-available" basis. While we strive to provide authentic and consistent work, we do not guarantee a continuous supply of Tasks or a specific level of income. To the fullest extent permitted by law, RMHSE shall not be liable for any indirect, incidental, or consequential damages arising out of your use of the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 border-b border-gray-200 pb-4">
                9. Governing Law
              </h2>
              <p className="mt-6">
                These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under these Terms will be subject to the exclusive jurisdiction of the courts located in [Insert City, e.g., New Delhi], India.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 border-b border-gray-200 pb-4">
                10. Contact Us
              </h2>
              <p className="mt-6">
                For any questions about these Terms and Conditions, please contact us.
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

export default TermsAndConditionsPage;