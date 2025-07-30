"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/store";
import { createRegisteration } from "@/lib/redux/registerationSlice";
import { fetchLeaderCode } from "@/lib/redux/userSlice"; // Import the thunk to verify the leader code
import { Loader2 } from "lucide-react";
import { verifyCredentialsAndGetLink } from "@/lib/redux/joinlinkSlice";
import Link from "next/link";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}


const Page = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [leaderCode, setLeaderCode] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [validatedLeaderName, setValidatedLeaderName] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  // NEW: State for the image modal
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState("");
  const [modalImageTitle, setModalImageTitle] = useState("");


  // Debounce the leaderCode input
  const debouncedLeaderCode = useDebounce(leaderCode, 500);

  useEffect(() => {
    if (!debouncedLeaderCode) {
      setValidatedLeaderName(null);
      setCodeError(null);
      return;
    }

    const verifyCode = async () => {
      setIsCheckingCode(true);
      setValidatedLeaderName(null);
      setCodeError(null);

      try {
        const leaderData = await dispatch(fetchLeaderCode(debouncedLeaderCode));
        // Check if the response indicates leader code not found
        if (leaderData?.message === "leader code not found") {
          setCodeError("Leader code not found. Please check and try again.");
          return;
        }
        // If we reach here and have leader data, it's a success
        if (leaderData?.name) {
          setValidatedLeaderName(leaderData.name);
        } else {
          setCodeError("Invalid leader code. Please try again.");
        }
      } catch (error: any) {
        // Handle different types of error responses
        if (error.response?.data?.message) {
          setCodeError(error.response.data.message);
        } else if (error.message) {
          setCodeError(error.message);
        } else {
          setCodeError("Invalid leader code. Please try again.");
        }
      } finally {
        setIsCheckingCode(false);
      }
    };

    verifyCode();
  }, [debouncedLeaderCode, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!leaderCode || !name || !phoneNumber) {
      toast.error("Leader Code, Name, and Phone Number are required.");
      setIsLoading(false);
      return;
    }

    // Check if leader code is validated
    if (!validatedLeaderName) {
      toast.error("Please enter a valid Leader Code first.");
      setIsLoading(false);
      return;
    }

    try {
      // Step 1: Create the registration since we already verified the code
      const registerationPayload = {
        name,
        phoneNumber,
        email: email || undefined,
        leaderCode,
      };

      const registerationResult = await dispatch(
        createRegisteration(registerationPayload)
      );

      if (registerationResult) {
        toast.success(
          "Registration successful! Redirecting to join the group...!"
        );
        const WHATSAPP_GROUP_APP_NAME = 'whatsapp';
        const whatsappLink = await dispatch(verifyCredentialsAndGetLink({ appName: WHATSAPP_GROUP_APP_NAME }));

        if (whatsappLink) {
          window.location.href = whatsappLink;
        } else {
          toast.info("Could not retrieve the group link. Redirecting to homepage.");
          router.push("/");
        }
      } else {
        toast.error(
          "Registration failed. This phone number or email may already be registered."
        );
      }
    } catch (error: any) {
      toast.error("Registration failed. Please try again later.");
      console.error("Registration process failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentClick = (imageUrl: string, title: string) => {
    setModalImageUrl(imageUrl);
    setModalImageTitle(title);
    setIsImageModalOpen(true);
  };


  return (
    <>
      <section className="w-full relative overflow-hidden" id="registeration">
        <div className="max-w-7xl w-full relative z-10 px-4 py-4 mx-auto">
          <div className="w-full flex justify-center min-h-screen ">
            <div className="relative w-full max-w-3xl flex flex-col items-center py-6">
              <Image
                src="/freelancersIcon.png"
                width={200}
                height={200}
                alt="Auth Image"
                className="mb-4"
              />
              <div className="w-full max-w-lg mx-auto rounded-3xl p-[2px] bg-gradient-to-b from-[#A6F4C5] to-[#B6A7FF]">
                <div className="w-full h-full flex flex-col items-center gap-6 rounded-[22px] bg-white/90 backdrop-blur-sm p-8 ">
                  <h1 className="font-bold text-2xl bg-gradient-to-r from-black via-purple-400 to-pink-200 via-60% bg-clip-text text-transparent">
                    Registration Form:{" "}
                  </h1>
                  <div className="w-full rounded-2xl p-[1.5px] bg-[linear-gradient(90deg,_#c6ffdd_0%,_#fbd786_50%,_#f7797d_100%)] bg-[length:200%_auto] transition-all duration-500 hover:bg-[position:100%_0] shadow-md hover:shadow-lg">
                    <div className="flex flex-col w-full items-center gap-4 rounded-[14px] bg-white py-10">
                      {/* Add form message section */}
                      {/* Update the error message display */}
                      {codeError && !isCheckingCode && (
                        <div className="w-full px-4 py-3 mb-2 bg-red-50 border border-red-200 rounded-md">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-red-500 text-xl">❌</span>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-red-800">Leader Code Not Found</h4>
                              <p className="text-sm text-red-600">{codeError}</p>
                              <p className="text-xs text-red-500 mt-1">
                                Please make sure you have entered the correct leader code
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      {validatedLeaderName && !isCheckingCode && (
                        <div className="w-full px-4 py-3 mb-2 bg-green-50 border border-green-200 rounded-md">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-green-500 text-xl">✓</span>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-green-800">Leader Code Verified</h4>
                              <p className="text-sm text-green-600">Team Leader: {validatedLeaderName}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      <form
                        className="flex flex-col gap-4"
                        onSubmit={handleSubmit}
                      >
                        <div className="relative">
                          <input
                            id="Leader Code"
                            value={leaderCode}
                            onChange={(e) => setLeaderCode(e.target.value)}
                            required
                            disabled={isLoading}
                            type="text"
                            placeholder="Team Leader Code"
                            className="border-[1px] border-gray-400 px-3 py-2 rounded-sm w-full"
                          />
                          {isCheckingCode && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                            </div>
                          )}
                        </div>
                        <input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          disabled={isLoading || !validatedLeaderName}
                          type="text"
                          placeholder="Your Name"
                          className={`border-[1px] border-gray-400 px-3 py-2 rounded-sm ${!validatedLeaderName ? 'bg-gray-100' : ''}`}
                        />
                        <input
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isLoading || !validatedLeaderName}
                          type="email"
                          placeholder="Your Email "
                          className={`border-[1px] border-gray-400 px-3 py-2 rounded-sm ${!validatedLeaderName ? 'bg-gray-100' : ''}`}
                        />
                        <input
                          id="phoneNumber"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          required
                          disabled={isLoading || !validatedLeaderName}
                          type="text"
                          placeholder="Your Mobile Number"
                          className={`border-[1px] border-gray-400 px-3 py-2 rounded-sm ${!validatedLeaderName ? 'bg-gray-100' : ''}`}
                        />
                        <div className="w-full mx-auto rounded-3xl p-[2px] bg-gradient-to-b from-[#A6F4C5] to-[#B6A7FF] hover:from-gold-200 hover:to-purple-500 transition-all duration-500">
                          <button
                            type="submit"
                            disabled={isLoading || !validatedLeaderName || isCheckingCode}
                            className="w-full h-full text-center rounded-[22px] bg-white/90 backdrop-blur-sm px-4 py-1 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading ? "Submitting..." : "Submit"}
                          </button>
                        </div>
                      </form>
                      {/* Remove the old status message div since we now have the new message sections */}
                      {isCheckingCode && (
                        <div className="mt-2 text-sm text-center h-5">
                          <span className="flex items-center justify-center text-gray-500">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying code...
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Motion divs for background blobs */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 0.2 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute block -right-[100px] top-[60px] lg:-top-[40px] lg:-right-[100px] h-[200px] w-[200px] lg:h-[300px] lg:w-[300px] bg-gradient-to-b from-purple-400 to-pink-200 rounded-full opacity-20"
        ></motion.div>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 0.2 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute block top-[260px] -left-[150px] lg:top-[220px] lg:-left-[240px] lg:h-[600px] h-[200px] w-[200px] lg:w-[600px] bg-gradient-to-b from-purple-400 to-pink-200 rounded-full opacity-20"
        ></motion.div>
        <div className="mt-5 mb-10 w-full flex flex-col items-center justify-center gap-3">
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
                <Link href="https://www.instagram.com/indiagrowup__?igsh=Ymttb3FoZGh1Zm1u" className="inline-flex items-center gap-1.5 underline ">Follow Us On Insta <Image src="/instagram.png" alt="instagram" width={16} height={16} className="w-4" /></Link></p>
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