import { Badge } from "@/components/ui/badge";

const AboutSection = () => {
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
              src="/about.mp4"
              width={474}
              height={578.341}
              className="rounded-[20px] shadow-xl w-[400px] h-[400px] md:w-[474px] md:h-[578.34px] object-cover"
              controls
            />
          </div>

          {/* Right Content - Text */}
          <div className="space-y-6">
            {/* Badge - Hidden on small screens */}
            <div className="hidden lg:inline-block">
              <Badge className="border-[1px] border-pink-500 text-pink-500 bg-pink-500/10 py-2 w-[240px] rounded-[20px] text-[20px] font-medium">
                About us
              </Badge>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-pink-500">RMHSE TRUST</h2>

            <div className="space-y-4 text-base md:text-[20px] leading-relaxed">
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
