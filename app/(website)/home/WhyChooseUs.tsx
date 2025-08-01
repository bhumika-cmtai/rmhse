import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monitor, Shield, Eye, Globe, Heart } from "lucide-react";

const WhyChooseUs = () => {
  const benefits = [
    {
      icon: Monitor,
      title: "100% Digital Platform",
      description:
        "Transparent, user-friendly donation and tracking system powered by cutting-edge technology",
      bgColor: "bg-green-500/9",
      borderColor: "border-green-500",
      color: "green-500",
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
      color: "blue-500",
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
      color: "yellow-500",
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
      color: "red-500",
      textColor: "text-red-500",
      circleColor: "bg-red-500/20",
      iconBg: "bg-red-500/20",
    },
    {
      icon: Heart,
      title: "Human Welfare Focus",
      description:
        "Transparent, user-friendly donation and tracking system powered by cutting-edge technology",
      bgColor: "bg-pink-100/9",
      borderColor: "border-pink-100",
      color: "pink-100",
      textColor: "text-pink-100",
      circleColor: "bg-pink-100/20",
      iconBg: "bg-pink-100/20",
    },
  ];

  return (
    <section className="w-full py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-block">
            <Badge className="border-[1px] border-pink-500 text-pink-500 bg-pink-500/10 py-2 w-[240px] rounded-[20px] text-[20px] font-medium">
              Why Choose Us
            </Badge>
          </div>

          <h2 className="text-4xl font-bold text-pink-500 my-4 ">
            Benefits & Features
          </h2>

          <p className="text-xl text-black max-w-2xl mx-auto">
            Experience the future of philanthropy with our comprehensive
            platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className={`relative overflow-hidden ${benefit.bgColor} ${benefit.borderColor} shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1`}
            >
              {/* Decorative Circles */}
              <div className={`absolute top-[-50px] left-[-50px] w-[200px] h-[200px] ${benefit.circleColor} rounded-full opacity-40 pointer-events-none`}></div>
              <div className={`absolute bottom-[-50px] right-[-50px] w-[160px] h-[160px] ${benefit.circleColor} rounded-full opacity-40 pointer-events-none`}></div>

              <CardContent className="px-6 py-2 relative z-10">
                <div className="space-y-4">
                  <div className="w-full flex flex-col items-center justify-center">
                    <div
                      className={`w-12 h-12 ${benefit.iconBg} rounded-lg flex items-center justify-center`}
                    >
                      <benefit.icon className="w-6 h-6 text-gray-600" />
                    </div>

                    <h3
                      className={`font-bold ${benefit.textColor} text-xl leading-tight py-2`}
                    >
                      {benefit.title}
                    </h3>
                  </div>

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
