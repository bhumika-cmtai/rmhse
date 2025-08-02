import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monitor, Shield, Eye, Globe, Heart } from "lucide-react";

const WhyChooseUs = () => {
  // Reverted to the original color definitions
  const benefits = [
    {
      icon: Monitor,
      title: "100% Digital Platform",
      description:
        "Transparent, user-friendly donation and tracking system powered by cutting-edge technology",
      bgColor: "bg-green-500/9",
      borderColor: "border-green-500",
      textColor: "text-green-500",
      circleColor: "bg-green-500/20",
      iconBg: "bg-green-500/20",
    },
    {
      icon: Shield,
      title: "Government-Approved & Legal",
      description:
        "Fully registered (Reg. No. 166/154), with Section 80G and 12A tax exemptions",
      bgColor: "bg-blue-500/9",
      borderColor: "border-blue-500",
      textColor: "text-blue-500",
      circleColor: "bg-blue-500/20",
      iconBg: "bg-blue-500/20",
    },
    {
      icon: Eye,
      title: "Transparent Donation Tracking",
      description:
        "Transparent, user-friendly donation and tracking system powered by cutting-edge technology",
      bgColor: "bg-yellow-500/9",
      borderColor: "border-yellow-500",
      textColor: "text-yellow-500",
      circleColor: "bg-yellow-500/20",
      iconBg: "bg-yellow-500/20",
    },
    {
      icon: Globe,
      title: "Nationwide Accessibility",
      description:
        "Supports multiple languages and serves diverse communities across India",
      bgColor: "bg-red-500/9",
      borderColor: "border-red-500",
      textColor: "text-red-500",
      circleColor: "bg-red-500/20",
      iconBg: "bg-red-500/20",
    },
    {
      icon: Heart,
      title: "Human Welfare Focus",
      description:
        "Transparent, user-friendly donation and tracking system powered by cutting-edge technology",
      // Note: The original provided a different color value for pink, which is preserved here.
      bgColor: "bg-pink-500/9",
      borderColor: "border-pink-500",
      textColor: "text-pink-500",
      circleColor: "bg-pink-500/20",
      iconBg: "bg-pink-500/20",
    },
  ];

  return (
    <section className="w-full py-10 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="inline-block">
            <Badge className="border-[1px] border-pink-500 text-pink-500 bg-pink-500/10 py-2 px-6 rounded-[20px] text-xl font-medium">
              Why Choose Us
            </Badge>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-pink-500 my-4">
            Benefits & Features
          </h2>
          <p className="text-lg md:text-xl text-black max-w-2xl mx-auto">
            Experience the future of philanthropy with our comprehensive
            platform
          </p>
        </div>

        {/* This grid handles the complex responsive layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 justify-center">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              // Card layout classes with original colors restored
              className={`
                relative overflow-hidden ${benefit.bgColor} border ${benefit.borderColor} 
                shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2 
                rounded-2xl text-center
                lg:col-span-2 lg:[&:nth-child(4)]:col-start-2
              `}
            >
              {/* Decorative Circles */}
              <div className={`absolute -top-12 -left-12 w-40 h-40 ${benefit.circleColor} rounded-full opacity-40 pointer-events-none`}></div>
              <div className={`absolute -bottom-16 -right-10 w-40 h-40 ${benefit.circleColor} rounded-full opacity-40 pointer-events-none`}></div>

              <CardContent className="p-6 relative z-10">
                <div className="flex flex-col items-center gap-4">
                  {/* Icon section with original colors restored */}
                  <div className={`w-14 h-14 ${benefit.iconBg} rounded-lg flex items-center justify-center`}>
                    <benefit.icon className="w-7 h-7 text-gray-700" />
                  </div>

                  <h3 className={`font-bold ${benefit.textColor} text-xl leading-tight`}>
                    {benefit.title}
                  </h3>
                  
                  <p className="text-black text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;