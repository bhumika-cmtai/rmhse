"use client";

import Head from 'next/head';
import { useState } from 'react';
// import cn from 'classnames';
import { cn } from '@/lib/utils';

// Helper component for list item markers
const ListMarker = () => (
  <svg
    className="h-6 w-6 flex-none text-green-600 mt-1"
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

// English Content for Members Tab
const MembersTerms = () => (
  <div className="space-y-8 mt-8">
    <h2 className="text-2xl font-bold tracking-tight text-gray-900">
      Terms and Conditions for Members
    </h2>
    <ul role="list" className="space-y-6 text-gray-800">
      <li className="flex gap-x-3"><ListMarker /><span>The member must follow the rules set by the Trust. It is mandatory for the member to complete their online registration for ₹350.</span></li>
      <li className="flex gap-x-3"><ListMarker /><span>The member is authorized to make payments through the system online only.</span></li>
      <li className="flex gap-x-3"><ListMarker /><span>Before availing any service, the member must register at the RMHSE Smart Center. A member can only avail one service at a time. The active level will be crucial for service delivery, ensuring services are provided according to the member's needs. Members must update their Aadhar ID under the category of 'helping trust', 'part-time', or 'full-time' and inform the Trust via WhatsApp at 7210050984 to complete the joining process.</span></li>
      <li className="flex gap-x-3"><ListMarker /><span>Every member must join the panel group associated with the services. The Trust holds the sole legal right to add, remove, or move members between groups.</span></li>
      <li className="flex gap-x-3"><ListMarker /><span>Every member must remain active before December, the last month of the year. An annual activity fee of ₹365 (₹1 per day) is required. Provisions for quarterly, half-yearly, and yearly payments are available. Being active is legally crucial for accessing services and holding positions.</span></li>
      <li className="flex gap-x-3"><ListMarker /><span>The Trust grants every member the right to enroll new members. In return, the Trust will provide an honorarium of ₹100, sent directly to the member's account, as a means of part-time employment and financial empowerment. For this, the member must update their ID on the rmhse.org site via the action plan after registering at the RMHSE Smart Center.</span></li>
      <li className="flex gap-x-3"><ListMarker /><span>The member must upload all their details accurately as per the system, authorized under the Trust's rules. Failure to do so may result in permanent suspension from services and positions by the system. The right to take this action is reserved by the Trust. It is legally mandatory to upload truthful information.</span></li>
      <li className="flex gap-x-3"><ListMarker /><span>The member is self-authorized to strictly follow the Trust's rules for humanitarian purposes and must cooperate with the Trust. This ensures all members are satisfied and services are delivered efficiently to those in need.</span></li>
      <li className="flex gap-x-3"><ListMarker /><span>To maintain mutual trust and happiness, both the Trust and its members pledge to remain committed to their responsibilities. Members agree to stay active, follow all rules, and understand that failure to comply gives the Trust the right to take appropriate action against them.</span></li>
    </ul>
  </div>
);

// English Content for Division In-charge Tab
const DivisionTerms = () => (
    <div className="space-y-8 mt-8">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900">
        Terms and Conditions for Division In-charge
      </h2>
      <ul role="list" className="space-y-6 text-gray-800">
        <li className="flex gap-x-3"><ListMarker /><span>The Division In-charge is authorized to perform the duties of the post as per the Trust's action plan. This is the first honorary position with provisions for promotion, viewed from a permanent/temporary employment perspective.</span></li>
        <li className="flex gap-x-3"><ListMarker /><span>The Division In-charge is entitled to receive an honorarium of ₹70 for each member's registration.</span></li>
        <li className="flex gap-x-3"><ListMarker /><span>The Trust will permit the Division In-charge to enroll 5,000 members through their ID. All members, including direct ones, will connect to the Trust's system via the Division In-charge's ID. The In-charge will receive an honorarium for all connected members, credited directly to their account.</span></li>
        <li className="flex gap-x-3"><ListMarker /><span>The Division In-charge is not eligible to receive an honorarium for part-time employment services from the RMHSE Smart Center. This condition applies to all officials up to the State In-charge level.</span></li>
        <li className="flex gap-x-3"><ListMarker /><span>Upon reaching 5,000 members, the Trust provides a promotion to the permanent post of District In-charge, which includes a good monthly honorarium. This will be determined based on the Trust's needs and will include a pension nominee provision.</span></li>
        <li className="flex gap-x-3"><ListMarker /><span>The Division In-charge's ID will be deactivated upon reaching 5,000 members. If the In-charge chooses not to accept a promotion, they can opt for retirement and receive a lifetime pension of ₹1,000/pm, provided their enrolled members remain active. The pension amount may decrease if the number of active members falls.</span></li>
        <li className="flex gap-x-3"><ListMarker /><span>The Trust grants the Division In-charge the right to accept donations through their ID, on which they will receive a 10% direct commission.</span></li>
        <li className="flex gap-x-3"><ListMarker /><span>All office-bearers of the RMHSE action plan must strictly follow the Trust's rules, such as no cash receipts, honesty, fulfilling humanitarian objectives, and understanding that expanding the Trust is their primary responsibility. They must remain loyal to the Trust and not attempt any wrongdoing. Otherwise, the RMHSE system will permanently relieve them from their post without any provision for pardon. A person removed from their post in the future will not be eligible to become a member of the Trust.</span></li>
        <li className="flex gap-x-3"><ListMarker /><span>This agreement between the Trust and action plan office-bearers will be considered a legally important compromise because it is a main part of our management. With its cooperation, the Trust's system will be implemented with honesty, which is the main objective of the Trust. No compromise will be valid in this... We both partners pledge to remain committed. They will be responsible for following the rules regarding online work. An appeal against this will also not be made legally.</span></li>
      </ul>
    </div>
);

// English Content for District In-charge Tab
const DistrictTerms = () => (
    <div className="space-y-8 mt-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Terms and Conditions for District In-charge
        </h2>
        <ul role="list" className="space-y-6 text-gray-800">
            <li className="flex gap-x-3"><ListMarker /><span>The District In-charge is authorized to perform the duties of the post, which is the second honorary position under the Trust's action plan, including promotion provisions and a permanent employment perspective.</span></li>
            <li className="flex gap-x-3"><ListMarker /><span>The District In-charge is entitled to receive an honorarium of ₹40 for each member's registration.</span></li>
            <li className="flex gap-x-3"><ListMarker /><span>The Trust will permit the District In-charge to create Division In-charges through their ID. All members will connect to the Trust system via the Division In-charge's ID. The honorarium for all connected members will be credited to the accounts of the Division and District In-charges.</span></li>
            <li className="flex gap-x-3"><ListMarker /><span>The District In-charge is not eligible for the part-time employment honorarium from the RMHSE Smart Center. This condition applies to officials up to the State In-charge level.</span></li>
            <li className="flex gap-x-3"><ListMarker /><span>The District In-charge must have at least 10 Division In-charges under them to qualify for promotion to the permanent post of State In-charge, which comes with a good monthly honorarium and a pension nominee provision.</span></li>
            <li className="flex gap-x-3"><ListMarker /><span>Upon reaching 50,000 members, the District In-charge's ID will be deactivated. They can then choose to retire and receive a lifetime pension of ₹5,000/pm, provided their enrolled members remain active. A decrease in active members will affect the pension amount.</span></li>
            <li className="flex gap-x-3"><ListMarker /><span>The District In-charge is authorized by the Trust to accept donations through their ID and will receive a 10% direct commission.</span></li>
            <li className="flex gap-x-3"><ListMarker /><span>All office-bearers must follow the Trust's rules strictly (no cash, honesty, etc.). The RMHSE system will permanently remove them from their post for any wrongdoing, without pardon. A dismissed individual cannot become a member of the Trust again.</span></li>
        </ul>
    </div>
);

// English Content for State In-charge Tab
const StateTerms = () => (
    <div className="space-y-8 mt-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Terms and Conditions for State In-charge
        </h2>
        <ul role="list" className="space-y-6 text-gray-800">
            <li className="flex gap-x-3"><ListMarker /><span>The State In-charge will be authorized to perform the duties of the post, an honorary position determined by the Trust's action plan, working directly with and according to the Trust.</span></li>
            <li className="flex gap-x-3"><ListMarker /><span>The State In-charge will receive an honorarium of ₹20 for each member's registration.</span></li>
            <li className="flex gap-x-3"><ListMarker /><span>The Trust will permit the State In-charge to create at least 5 District In-charges through their ID. All members connecting through the Division In-charges will generate an honorarium for the State In-charge, credited directly to their account.</span></li>
            <li className="flex gap-x-3"><ListMarker /><span>The State In-charge is not eligible for the part-time employment honorarium from the RMHSE Smart Center.</span></li>
            <li className="flex gap-x-3"><ListMarker /><span>A State In-charge must have at least 5 District In-charges under them to qualify for promotion to a permanent State In-charge post, which includes a good monthly honorarium and a pension nominee provision.</span></li>
            <li className="flex gap-x-3"><ListMarker /><span>Upon reaching 2.5 lakh (250,000) members, the State In-charge's ID will be deactivated. They can then opt for retirement and receive a lifetime pension of ₹25,000/pm, contingent on their enrolled members remaining active. A decrease in active members will affect the pension amount.</span></li>
            <li className="flex gap-x-3"><ListMarker /><span>The State In-charge is authorized to accept donations via their ID and will receive a 10% direct commission.</span></li>
            <li className="flex gap-x-3"><ListMarker /><span>All office-bearers must adhere to the Trust’s principles (no cash, honesty, etc.). Violations will lead to permanent removal by the RMHSE system, with no chance of pardon or re-membership.</span></li>
            <li className="flex gap-x-3"><ListMarker /><span>This agreement is a vital legal understanding with our management. It ensures the Trust's system operates with integrity, its primary goal. No compromises will be accepted. Both parties pledge to uphold these terms.</span></li>
        </ul>
    </div>
);

// English Content for Trusty Tab
const TrustyTerms = () => (
    <div className="space-y-8 mt-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Terms and Conditions for Trusty
        </h2>
        <ul role="list" className="space-y-6 text-gray-800">
            <li className="flex gap-x-3"><ListMarker /><span>A Trusty will be authorized to act in the capacity of a Trustee, a decision that legally grants them all rights as per the Trust Deed. This is a primary honorary position determined by the Trust.</span></li>
            <li className="flex gap-x-3"><ListMarker /><span>The Trusty is entitled to receive an honorarium of ₹10 for each member's registration.</span></li>
            <li className="flex gap-x-3"><ListMarker /><span>The Trusty is permitted to directly appoint State In-charges through their ID. All members joining through this hierarchy will generate an honorarium for the Trusty, which will be credited directly to their bank account.</span></li>
            <li className="flex gap-x-3"><ListMarker /><span>The Trusty will be considered equally involved in all activities of the Trust and has the right to contribute to its honor, respect, and expansion.</span></li>
            <li className="flex gap-x-3"><ListMarker /><span>It is the Trusty's primary right and responsibility to use their experience and skills for the Trust's benefit and to maintain its confidentiality. Acting against this can lead to removal from the post by a consensus-based decision in a meeting, and the individual cannot legally hold the post in the future.</span></li>
            <li className="flex gap-x-3"><ListMarker /><span>It is the Trusty's right to have complete knowledge of the Trust's functioning and to perform their duties with truth, honesty, and responsibility. In case of non-compliance, action can be taken against the Trusty in a major meeting, which is the right of the Trust.</span></li>
            <li className="flex gap-x-3"><ListMarker /><span>The Trusty is authorized by the Trust to accept donations via their ID and will receive a 10% direct commission.</span></li>
            <li className="flex gap-x-3"><ListMarker /><span>All office-bearers of the RMHSE action plan must strictly adhere to the Trust's rules (e.g., no cash receipts, honesty, focus on human welfare, treating Trust expansion as their primary duty, and remaining trustworthy). Any wrongdoing will lead to permanent dismissal by the RMHSE system. There is no provision for pardon, and a dismissed person cannot become a member again.</span></li>
            <li className="flex gap-x-3"><ListMarker /><span>This agreement between the Trust and action plan office-bearers is a crucial legal compact, as it forms the core of our management. Its cooperation ensures the Trust's system is implemented with integrity, which is our main objective. No compromises will be entertained. We, as partners, commit to this pledge. We will be responsible for following the rules regarding online work and will not legally appeal against them.</span></li>
        </ul>
    </div>
);


type Tab = 'members' | 'division' | 'district' | 'state' | 'trusty';

const TermsAndConditionsPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>('members');

  const tabContent = {
    members: <MembersTerms />,
    division: <DivisionTerms />,
    district: <DistrictTerms />,
    state: <StateTerms />,
    trusty: <TrustyTerms />,
  };

  return (
    <>
      <Head>
        <title>Terms and Conditions - RMHSE Trust</title>
        <meta
          name="description"
          content="Review the Terms and Conditions for Members, Division, District, State In-charges, and Trusties of RMHSE Trust."
        />
      </Head>

      <div className="bg-white px-6 py-24 sm:py-32 lg:px-8 mt-16">
        <div className="mx-auto max-w-4xl text-base leading-7 text-gray-700">
          <p className="text-base font-semibold leading-7 text-green-600">
            Rules of Engagement
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Terms and Conditions
          </h1>
          
          <div className="mt-10 border-b border-gray-200">
            <nav className="-mb-px flex flex-wrap gap-x-6 gap-y-2" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('members')}
                className={cn(
                  'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium',
                  activeTab === 'members'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                )}
              >
                Members
              </button>
              <button
                onClick={() => setActiveTab('division')}
                className={cn(
                  'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium',
                  activeTab === 'division'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                )}
              >
                Division In-charge
              </button>
              <button
                onClick={() => setActiveTab('district')}
                className={cn(
                  'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium',
                  activeTab === 'district'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                )}
              >
                District In-charge
              </button>
              <button
                onClick={() => setActiveTab('state')}
                className={cn(
                  'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium',
                  activeTab === 'state'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                )}
              >
                State In-charge
              </button>
              <button
                onClick={() => setActiveTab('trusty')}
                className={cn(
                  'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium',
                  activeTab === 'trusty'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                )}
              >
                Trusty
              </button>
            </nav>
          </div>

          <div className="mt-8">
            {tabContent[activeTab]}
          </div>

        </div>
      </div>
    </>
  );
};

export default TermsAndConditionsPage;