"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/store";
import { addContact } from "@/lib/redux/contactSlice";
import { toast } from "sonner";

// Import Shadcn UI & Lucide Icons
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2 } from "lucide-react"; // Icon for key points

const ContactUs = () => {
    const dispatch = useDispatch<AppDispatch>();

    // State for the form fields
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [message, setMessage] = useState("");

    // State for submission status
    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState("");

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!name || !phoneNumber || !message) {
            setFormError("Name, Phone Number, and Message are required.");
            return;
        }
        setFormError("");
        setIsLoading(true);

        const contactData = { name, email, phoneNumber, message };
        const resultAction = await dispatch(addContact(contactData));

        if (resultAction) {
            toast.success("Your message is received! We will contact you shortly.");
            setName("");
            setEmail("");
            setPhoneNumber("");
            setMessage("");
        } else {
            toast.error("Failed to send message. Please try again later.");
        }
        
        setIsLoading(false);
    };
    
  return (
    <section className="w-full md:py-10" id="contact">
      <div className="container mx-auto px-10">
        {/* Re-introduce the two-column grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          
          {/* === Left Content - New Text from Images === */}
          <div className="space-y-6 flex flex-col justify-center">
            <div className="hidden lg:inline-block">
              <Badge className="border-[1px] border-pink-500 text-pink-500 bg-pink-500/10 py-1 px-6 rounded-[20px] text-xl font-medium">
                Contact Us
              </Badge>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-pink-500">
              A Govt. Approved RMHSE Trust
            </h2>
            <p className="text-xl text-gray-800 font-semibold">
              राष्ट्रीय मानव हम सब एक (Regd.)
            </p>

            <div className="space-y-4 text-base md:text-lg text-gray-700">
            
              <ul className="space-y-2 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-pink-500" />
                  <span>Transparent Digital Platform</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-pink-500" />
                  <span>Nationwide Employment Opportunities</span>
                </li>
              </ul>

              <p className="pt-2">
                Whether you have questions about our mission, wish to join our cause, or require support, we are here to help. Please use the form to get in touch with our dedicated team.
              </p>
            </div>
          </div>

          {/* === Right Content - The Contact Form === */}
          <div className="flex flex-col justify-center">
            <Card className="w-full max-w-lg mx-auto rounded-2xl shadow-lg border-pink-500/20">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-pink-500">Get in Touch</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll contact you shortly.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="Enter your phone number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="email">Email Address (Optional)</Label>
                    <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="Type your message here..." className="min-h-[100px]" value={message} onChange={(e) => setMessage(e.target.value)} required />
                  </div>
                   {formError && <p className="text-red-500 text-sm text-center">{formError}</p>}
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 rounded-lg" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Message"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ContactUs;