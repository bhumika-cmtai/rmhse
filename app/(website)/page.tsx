import React from 'react';

const Page = () => {
  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md text-center border border-green-200">
        <h1 className="text-3xl font-bold text-green-700 mb-4">We'll be back soon!</h1>
        <p className="text-green-600 mb-6">
          Our website is currently under maintenance. We’re working hard to improve your experience.
        </p>
        <p className="text-sm text-green-500">
          For help, contact us at <br />
          <a href="mailto:nikhil.chaudhary@cmtai.in" className="underline text-green-700 font-medium">
            nikhil.chaudhary@cmtai.in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Page;
