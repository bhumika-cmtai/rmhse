"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { AppDispatch, RootState } from "@/lib/store";
import {
  fetchAllNotifications,
  selectAllNotifications,
  selectLoading,
  selectError,
  Notification
} from "@/lib/redux/notificationSlice";

// Import Shadcn & Lucide Components
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Edit } from "lucide-react"; // Added 'Edit' for the register card

// --- Style Definitions (no changes here) ---
const cardStyles = [
  // Style for the 1st card (index 0)
  {
    bgColor: "bg-green-500/10",
    circleColor: "bg-green-500/10",
    iconBg: "bg-green-500/20",
    iconColor: "text-green-800",
  },
  // Style for the 2nd card (index 1)
  {
    bgColor: "bg-yellow-500/10",
    circleColor: "bg-yellow-500/10",
    iconBg: "bg-yellow-500/20",
    iconColor: "text-yellow-800",
  },
  {
    bgColor: "bg-green-500/10",
    circleColor: "bg-green-500/10",
    iconBg: "bg-green-500/20",
    iconColor: "text-green-800",
  },
  // Style for the 3rd card (index 2)
  {
    bgColor: "bg-blue-500/10",
    circleColor: "bg-blue-500/10",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-800",
  },
];


const LatestNotification = () => {
  const dispatch = useDispatch<AppDispatch>();

  const notifications = useSelector(selectAllNotifications);
  const isLoading = useSelector(selectLoading);
  const error = useSelector(selectError);

  useEffect(() => {
    dispatch(fetchAllNotifications({ page: 1, limit: 3 }));
  }, [dispatch]);

  const CardWrapper = ({ notification, children }: { notification: Notification; children: React.ReactNode }) => {
    if (notification.link) {
      return <Link href={notification.link} className="block h-full">{children}</Link>;
    }
    return <div className="h-full">{children}</div>;
  };

  // Determine if we should show dynamic notifications or the fallback
  const showDynamicNotifications = !isLoading && !error && notifications.length > 0;

  return (
    <section className="w-full py-10 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="inline-block">
            <Badge className="border-[1px] border-pink-500 text-pink-500 bg-pink-500/10 py-2 px-6 rounded-[20px] text-xl font-medium">
              Latest Updates
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
          {showDynamicNotifications ? (
            // === RENDER DYNAMIC NOTIFICATIONS ===
            notifications.map((notification, index) => {
              const currentStyle = cardStyles[index % cardStyles.length];
              
              return (
                <CardWrapper key={notification._id} notification={notification}>
                <Card
                  className={`
                    relative overflow-hidden ${currentStyle.bgColor} border border-black/20
                    shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2 
                    rounded-2xl text-center h-full flex flex-col
                  `}
                >
                  {/* Decorative Circles with dynamic color
                  <div className={`absolute -top-12 -left-12 w-40 h-40 ${currentStyle.circleColor} rounded-full opacity-40 pointer-events-none`}></div>
                  <div className={`absolute -bottom-16 -right-10 w-40 h-40 ${currentStyle.circleColor} rounded-full opacity-40 pointer-events-none`}></div> */}

                  <CardContent className="p-6 relative z-10 flex flex-col items-center gap-4 flex-grow">
                    {/* Icon section with dynamic color */}
                    <div className={`w-14 h-14 ${currentStyle.iconBg} rounded-lg flex items-center justify-center`}>
                      <Megaphone className={`w-7 h-7 ${currentStyle.iconColor}`} />
                    </div>

                    <h3 className="font-bold text-black text-xl leading-tight">
                      {notification.title}
                    </h3>
                    
                    <p className="text-black/80 text-sm leading-relaxed">
                      {notification.message}
                    </p>
                  </CardContent>
                </Card>
              </CardWrapper>
              )
            })
          ) : (
            // === RENDER FALLBACK "REGISTER NOW" CARD ===
            // We place it in a grid item to align it correctly, even if it's the only one.
            <div className="lg:col-start-2 md:col-span-2 lg:col-span-1">
              <Link href="/signup" className="block h-full">
                <Card
                  className="
                    relative overflow-hidden bg-green-500/10 border border-black/20
                    shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2 
                    rounded-2xl text-center h-full flex flex-col
                  "
                >
                  {/* <div className="absolute -top-12 -left-12 w-40 h-40 bg-red-500/10 rounded-full opacity-40 pointer-events-none"></div>
                  <div className="absolute -bottom-16 -right-10 w-40 h-40 bg-red-500/10 rounded-full opacity-40 pointer-events-none"></div> */}

                  <CardContent className="p-6 relative z-10 flex flex-col items-center gap-4 flex-grow justify-center">
                    <div className="w-14 h-14 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Megaphone className="w-7 h-7 text-green-800" />
                    </div>
                    <h3 className="font-bold text-black text-xl leading-tight">
                      Register Now
                    </h3>
                    <p className="text-black/80 text-sm leading-relaxed">
                      Hurry, only a few seats left! Secure your spot today.
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default LatestNotification;