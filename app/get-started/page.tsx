"use client";
// Import useState, useEffect, and other necessary hooks/components
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
// NEW: Import Redux hooks and the action to fetch the link
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/store";
import { verifyCredentialsAndGetLink } from "@/lib/redux/joinlinkSlice";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle,DialogHeader } from "@/components/ui/dialog";

const Page = () => {
  // NEW: Initialize Redux dispatch
  const dispatch = useDispatch<AppDispatch>();
  // NEW: State for the image modal
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState("");
  const [modalImageTitle, setModalImageTitle] = useState("");

  const initialTimeInSeconds = 1 * 60;
  
  const [timeLeft, setTimeLeft] = useState(initialTimeInSeconds);
  // NEW: State to manage the loading status of the Zoom link fetch
  const [isFetchingZoom, setIsFetchingZoom] = useState(false);

  useEffect(() => {
    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          return initialTimeInSeconds;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // NEW: Function to handle the Zoom link button click
  const handleZoomClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent any default button behavior
    setIsFetchingZoom(true);

    // This appName MUST match an entry in your database's joinlinks collection
    const ZOOM_APP_NAME = 'zoom';

    try {
      const link = await dispatch(verifyCredentialsAndGetLink({ appName: ZOOM_APP_NAME }));

      if (link) {
        // Redirect to the fetched link if successful
        window.location.href = link;
      }
      // If the link is null, the thunk already shows an error toast, so we don't need to do anything here.
    } catch (error) {
      console.error("Failed to fetch Zoom link:", error);
      // The thunk should handle the toast, but this is a fallback.
    } finally {
      // Ensure the loading state is turned off, even if redirection fails
      setIsFetchingZoom(false);
    }
  };

  const handleDocumentClick = (imageUrl: string, title: string) => {
    setModalImageUrl(imageUrl);
    setModalImageTitle(title);
    setIsImageModalOpen(true);
  };


  return (
    <>
    <section
      className="relative w-full z-10 py-4 mx-auto overflow-hidden"
      id="get-started"
    >
      <div className="w-full flex justify-center px-4">
        <div className="relative w-full max-w-3xl flex flex-col items-center">
          
          <div className="mb-4 text-center">
            <p className="text-xl font-bold text-red-600 animate-pulse">
              Time Left: {minutes}:{seconds < 10 ? `0${seconds}` : seconds} mins
            </p>
          </div>
          
          <div className="w-full max-w-md mx-auto rounded-3xl p-[2px] bg-gradient-to-b from-[#A6F4C5] to-[#B6A7FF]">
            <div className="w-full h-full flex flex-col items-center gap-6 rounded-[22px] bg-white/90 backdrop-blur-sm p-6 md:p-10">
              {/* STEP - 1 JOIN WHATSAPP --> REGISTER FORM*/}
              <div className="w-full rounded-2xl p-[1.5px] bg-[linear-gradient(90deg,_#c6ffdd_0%,_#fbd786_50%,_#f7797d_100%)] bg-[length:200%_auto] transition-all duration-500 hover:bg-[position:100%_0] shadow-md hover:shadow-lg">
                <Link href="/registeration" className="flex w-full items-center  rounded-[14px] bg-white p-4">
                  <div className="flex-shrink-0">
                    <Image
                      src="/whatsapp.png"
                      width={48}
                      height={48}
                      alt="icon"
                      className="object-contain"
                    />
                  </div>
                  
                  <div className="text-center flex-grow">
                    <h2
                      className={`text-lg font-bold bg-gradient-to-r from-gray-700 to-green-400 bg-clip-text text-transparent`}
                    >
                      Step- 1
                    </h2>
                    <h3 className="text-xl text-center font-semibold text-gray-800">
                      Join Our WhatsApp Hub
                    </h3>
                  </div>
                </Link>
              </div>

              {/* NEW: STEP - 2 Zoom Link - Converted to a button with an onClick handler */}
              <div className="w-full rounded-2xl p-[1.5px] bg-[linear-gradient(90deg,_#c6ffdd_0%,_#fbd786_50%,_#f7797d_100%)] bg-[length:200%_auto] transition-all duration-500 hover:bg-[position:100%_0] shadow-md hover:shadow-lg">
                <button
                  onClick={handleZoomClick}
                  disabled={isFetchingZoom}
                  className="flex w-full items-center rounded-[14px] bg-white p-4 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <div className="flex-shrink-0">
                    <Image
                      src="/zoom.png"
                      width={48}
                      height={48}
                      alt="zoom icon"
                      className="object-contain"
                    />
                  </div>
                   
                  <div className="text-center flex-grow">
                    {isFetchingZoom ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-gray-600 font-semibold">Fetching Link...</span>
                      </div>
                    ) : (
                      <>
                        <h2
                          className={`text-lg font-bold bg-gradient-to-r from-gray-700 to-blue-600 bg-clip-text text-transparent`}
                        >
                          Step- 2
                        </h2>
                        <h3 className="text-xl text-center font-semibold text-gray-800">
                          Zoom Link
                        </h3>
                      </>
                    )}
                  </div>
                </button>
              </div>

              {/* STEP-3 TEST LINK */}
              <div className="w-full rounded-2xl p-[1.5px] bg-[linear-gradient(90deg,_#c6ffdd_0%,_#fbd786_50%,_#f7797d_100%)] bg-[length:200%_auto] transition-all duration-500 hover:bg-[position:100%_0] shadow-md hover:shadow-lg">
                <Link href="/test" className="flex w-full items-center  rounded-[14px] bg-white p-4">
                  <div className="flex-shrink-0">
                    <Image
                      src="/skillImg.png"
                      width={60}
                      height={60}
                      alt="assessment icon"
                      className="object-contain"
                    />
                  </div>
                   
                  <div className="text-center flex-grow">
                    <h2
                      className={`text-lg font-bold bg-gradient-to-r from-gray-700 to-gray-400 bg-clip-text text-transparent`}
                    >
                      Step- 3
                    </h2>
                    <h3 className="text-xl text-center font-semibold text-gray-800">
                      Test Link
                    </h3>
                  </div>
                </Link>
              </div>

              {/* STEP - 4 Access Franchise Link Channel   */}
              <div className="w-full rounded-2xl p-[1.5px] bg-[linear-gradient(90deg,_#c6ffdd_0%,_#fbd786_50%,_#f7797d_100%)] bg-[length:200%_auto] transition-all duration-500 hover:bg-[position:100%_0] shadow-md hover:shadow-lg">
                <Link href="/telegram" className="flex w-full items-center  rounded-[14px] bg-white p-4">
                  <div className="flex-shrink-0">
                    <Image
                      src="/telegram.png"
                      width={48}
                      height={48}
                      alt="telegram icon"
                      className="object-contain"
                    />
                  </div>
                   
                  <div className="text-center flex-grow">
                    <h2
                      className={`text-lg font-bold bg-gradient-to-r from-gray-700 to-blue-600 bg-clip-text text-transparent`}
                    >
                      Step- 4
                    </h2>
                    <h3 className="text-xl text-center font-semibold text-gray-800">
                      Access Franchise Link Channel
                    </h3>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-16 -right-32 z-20 hidden lg:block">
            <Image
              src="/authImg.png" 
              alt="Security illustration"
              width={300}
              height={300}
              className="pointer-events-none"
            />
          </div>
        </div>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 0.2 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute block -right-[100px] top-[60px] lg:-top-[40px] lg:-right-[200px] h-[200px] w-[200px] lg:h-[460px] lg:w-[460px] bg-gradient-to-b from-purple-400 to-pink-200 rounded-full opacity-20"
        ></motion.div>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 0.2 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute block top-[260px] -left-[150px] lg:top-[240px] lg:-left-[240px] lg:h-[600px] h-[200px] w-[200px] lg:w-[600px] bg-gradient-to-b from-purple-400 to-pink-200 rounded-full opacity-20"
        ></motion.div>
      </div>

      <div className="mt-10 w-full flex flex-col items-center justify-center gap-3">
        <div className="flex items-center gap-2">
            <Image
              src="/legalImg.png" 
              width={40}
              height={40}
              alt="Document icon"
              />
            <div className="text-lg font-semibold text-black">Legal Documents:</div>
           
        </div>
        <div className="w-full border-t-[1px] border-t-black flex justify-center pt-4">
            
          <div className="flex flex-col gap-2 items-start px-4">
           <button onClick={() => handleDocumentClick('/pan_card.jpg', 'PAN Card')} className="text-left underline cursor-pointer hover:text-blue-600 transition-colors">PAN Card</button>
              <button onClick={() => handleDocumentClick('/udyam_Registration Certificate.jpg', 'Udyam Registration Certificate')} className="text-left underline cursor-pointer hover:text-blue-600 transition-colors">Udyam Registration Certificate</button>
              <button onClick={() => handleDocumentClick('/gst_certificate.jpg', 'GST Certificate')} className="text-left underline cursor-pointer hover:text-blue-600 transition-colors">GST Certificate</button>
            <p className="text-left"> <Link className="underline" href="/privacy-policy">Privacy-Policy</Link> | <Link className="underline" href="/terms-and-conditions">Terms and Conditions</Link> | 
            <Link href="https://www.instagram.com/indiagrowup__?igsh=Ymttb3FoZGh1Zm1u" className="inline-flex items-center gap-1.5 underline ">Follow Us On Insta <Image src="/instagram.png" alt="instagram" width={16} height={16} className="w-4"/></Link></p>
          </div>
        </div>
      </div>
      {/* NEW: Dialog component for displaying the image */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{modalImageTitle}</DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-[70vh] mt-4">
            <Image
              src={modalImageUrl}
              alt={modalImageTitle}
              fill
              className="object-contain"
              priority={true} // Prioritize loading the image in the modal
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
    </>
  );
};

export default Page;