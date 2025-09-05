"use client";

import React from "react";

export default function MaintenancePage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 px-4">
      <div className="text-center p-10 bg-white shadow-2xl rounded-3xl max-w-lg w-full border border-gray-200">
        <h1 className="text-4xl font-extrabold text-red-600 mb-6">
          Alert
        </h1>
        <p className="text-gray-700 leading-relaxed">
          We tried connecting with you but you seen to be unresponsive.
          <br />
          Due to this website services are temporary down. For More information please contact{" "}
          <span className="font-semibold text-blue-600">ceo@cmtai.in</span>.
        </p>
      </div>
  </div>
 );
}