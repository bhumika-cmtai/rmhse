"use client"
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

const AboutSection = () => {
  const [videoUrl, setVideoUrl] = useState("/about.mp4");
  useEffect(() => {
    // This function runs when the component loads
    const fetchVideo = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/video`);
        const data = await response.json();

        // If the request was successful and the server sent back video data with a URL
        if (response.ok && data.data) {
          setVideoUrl(data.data.url);
        }
      } catch (error) {
        console.error("Could not fetch the video, using fallback.", error);
        // If there's an error, the default fallback URL will be used
      }
    };

    fetchVideo();
  }, []); 
  return (
    <section className="w-full  md:py-10" id="about">
      <div className="container mx-auto px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Content - Video */}
          <div className="relative py-4 flex flex-col items-center lg:items-start gap-4">
            {/* Badge - Visible on small screens only */}
            <div className="block lg:hidden mb-4 md:mb-0">
              <Badge className="border-[1px] border-pink-500 text-pink-500 bg-pink-500/10 py-2 w-[240px] rounded-[20px] text-[20px] font-medium text-center">
                About us
              </Badge>
            </div>

            <video
              key={videoUrl} // CRITICAL: This forces React to re-mount the video element when the URL changes, ensuring the new video loads.
              src={videoUrl}
              width={474}
              height={578.341}
              // autoPlay={true}
              // loop // Good to add for background-style videos
              // muted // Required for autoplay in most modern browsers
              className="rounded-[20px] shadow-xl w-[400px] h-[400px] md:w-[474px] md:h-[578.34px] object-contain"
              controls
            />
          </div>

          {/* Right Content - Text */}
          <div className="space-y-6">
            {/* Badge - Hidden on small screens */}
            <div className="hidden lg:inline-block">
              <Badge className="border-[1px] border-pink-500 text-pink-500 bg-pink-500/10 py-1 w-[240px] rounded-[20px] text-[20px] font-medium">
                About us
              </Badge>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-pink-500">RMHSE TRUST</h2>

            <div className="space-y-3 text-base md:text-[18px] ">
              <p>RMHSE Goolak India</p>
              <p>
                ₹1/- प्रतिदिन के अनुदान राशि के राष्ट्रीय कोष का संचालन सभी
                सदस्यों के माध्यम से सेवाओं को सुरक्षित रूप से संचालित किया जाएगा
              </p>
              <p>
                राष्ट्र में यह अनोखी तकनीकी सेवाएं तत्काल सेवाधारकों की आर्थिक मदद
                पहुंचाने में एक आसान, मजबूत विचारधारा का जरिया होगी
              </p>
              <p>
                एक विश्वास संतुष्टि का प्रमाण सिद्ध करना ही RMHSE TRUST का मूल
                उद्देश्य है।।
              </p>
              <p className="">
              राष्ट्रीय सहायता सेवा की ओर से यह ट्रस्ट अपने सदस्यों को कमाई के अवसर भी प्रदान करता है, जिसमें तीन स्तरों पर क्रमशः ₹1,750, ₹25,000 और ₹3,12,500 की आय आवंटित की गई है।
              </p>
              <p>संगठन में सदस्यों के लिए सिल्वर, गोल्ड और डायमंड जैसे पद निर्धारित हैं। इसके अतिरिक्त, सदस्यों के लिए एक विशेष आरएमएचएसई ट्रस्ट क्रेडिट कार्ड की सुविधा भी है, जिसकी सीमा सिल्वर के लिए 25,000, गोल्ड के लिए 50,000 और डायमंड के लिए 2 लाख रुपये है। 
              </p>
              
              <p>यह कार्ड केवल ट्रस्ट द्वारा अनुशंसित सेवाओं के लिए ही उपलब्ध है और इसकी प्रोसेसिंग आरएमएचएसई ट्रस्ट गुल्लक इंडिया की ओर से की जाती है।
              </p>

              
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
