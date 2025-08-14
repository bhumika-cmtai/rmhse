"use client";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

const OurProcess = () => {
  return (
   <div
    className="min-h-screen relative bg-no-repeat bg-center bg-cover flex items-center justify-center pt-20 pb-10 md:py-0 "
    style={{ backgroundImage: "url('/processBgImg.png')" }}
    >
  <div className="relative w-full max-w-[1200px] mx-auto px-10 grid grid-cols-1 md:grid-cols-2 items-center gap-12 z-10 md:py-20">
    {/* Badge */}
    <Badge className="absolute md:top-20 -top-10 left-1/2 md:left-48  -translate-x-1/2 px-6 border-[1px] border-pink-500 text-pink-500 bg-pink-500/10 py-2 w-[240px] rounded-[20px] text-[20px] font-semibold">
      Our Process
    </Badge>

    {/* Left: Text Content */}
    <div className="pl-0 md:pl-10 flex flex-col items-start md:items-start text-left md:text-left ">
  <h2 className="text-2xl md:text-4xl font-bold text-pink-500 my-8 md:mb-12">
    How We Create Impact
  </h2>

       <div className="flex flex-col gap-8 md:gap-10 items-center md:items-start">
        {/* Step 1 */}
        <div className="flex items-start gap-4">
          <div className="text-base bg-black text-white p-1 rounded">🧾</div>
          <div>
            <h3 className="font-bold text-black">
              Join registration fee one time only 350/-
            </h3>
            <p className="text-sm text-gray-700">
            This one-time fee covers administrative costs and gives you access to our platform and support services. 
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start gap-4">
          <div className="text-base bg-black text-white p-1 rounded">📄</div>
          <div>
            <h3 className="font-bold uppercase">Document Verification</h3>
            <p className="text-sm text-gray-700">
            To ensure the safety and security of our platform, we require document verification and the verification is a simple and quick process.

            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex items-start gap-4">
          <div className="text-base bg-black text-white p-1 rounded">💰</div>
          <div>
            <h3 className="font-bold uppercase">Earn Money</h3>
            <p className="text-sm text-gray-700">
            Once your registration and verification are complete, you can start earning
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Right: Image */}
    <div className="w-full flex justify-center mb-16 md:mt-0">
  <Image
    src="/processImg.jpg"
    alt="Process illustration"
    width={300}
    height={300}
    className="w-[240px] md:w-full object-contain rounded-md"
  />
</div>
  </div>
</div>

  );
};

export default OurProcess;
