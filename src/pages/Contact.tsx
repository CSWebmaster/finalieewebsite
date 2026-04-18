import React, { useState, useRef } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import PageLayout from "@/components/PageLayout";
import { TypingAnimation } from "@/components/TypingAnimation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { sendEmail } from "@/lib/sendEmail";
import { saveToGoogleSheets } from "@/lib/googleSheets";
import { useLatencyTracker } from "@/hooks/useLatencyTracker";

export default function ContactUs() {
  useLatencyTracker("ContactPage");
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;

    const name = (form.querySelector("#name") as HTMLInputElement)?.value.trim();
    const email = (form.querySelector("#email") as HTMLInputElement)?.value.trim();
    const phone = (form.querySelector("#phone") as HTMLInputElement)?.value.trim();
    const message = (form.querySelector("#message") as HTMLTextAreaElement)?.value.trim();

    if (!name || !email) {
      toast.error("Please fill in your name and email.");
      return;
    }

    setIsLoading(true);
    try {
      const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

      // 1. Save to Firestore
      await addDoc(collection(db, "contacts"), {
        name, email, phone, message,
        createdAt: serverTimestamp(),
        status: "new",
      });

      // 2. Save to Google Sheets (non-blocking — won't fail the submission)
      saveToGoogleSheets({ sheet: "contact", timestamp, name, email, phone: phone || "", message: message || "" })
        .catch((err) => console.error("[GoogleSheets] Contact save failed:", err));

      // 3. Send notification email
      await sendEmail({ name, email, phone, message, page: "Contact" });

      toast.success("Message sent! We'll get back to you soon.");
      form.reset();
    } catch (err: unknown) {
      console.error("Submission error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout showFooter>
      <main className="flex-grow pt-16 pb-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 rounded-2xl transition-all duration-300 hover:shadow-[0_0_40px_rgba(59,130,246,0.12)] p-4">
          <div className="mb-12 text-left pt-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Contact Us</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              <TypingAnimation text={"Have a question or want to know more about our IEEE SOU SB? Reach out to us and we'll get back to you as soon as possible."} />
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 flex flex-col justify-center shadow-lg backdrop-blur-sm border border-white/20">
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Name</Label>
                  <Input id="name" placeholder="Your name" className="text-foreground" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <Input id="email" type="email" placeholder="Your email" className="text-foreground" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">Phone</Label>
                  <Input id="phone" placeholder="Your phone number" className="text-foreground" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-foreground">Message</Label>
                  <Textarea id="message" placeholder="How can we help you?" rows={4} className="text-foreground" />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending…" : "Send Message"}
                </Button>
              </form>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg backdrop-blur-sm border border-white/20">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Visit Us</h3>
                <p className="text-muted-foreground">
                  Silver Oak University, Nr. Bhavik Publications, Opp. Bhagwat Vidyapith, S.G.Highway,
                  Ahmedabad, Gujarat - 382481
                </p>

                <div className="mt-4 aspect-video w-full rounded-md overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d476.78406741357975!2d72.53434092597261!3d23.090371607367445!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e833af6f39347%3A0xf1db9065daea7008!2sSilver%20Oak%20University!5e0!3m2!1sen!2sin!4v1744895318209!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    title="Silver Oak University Map"
                  ></iframe>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg backdrop-blur-sm border border-white/20">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Contact Information</h3>
                <ul className="space-y-3">
                  <li className="text-muted-foreground">
                    <span className="font-medium text-foreground">Email:</span>{" "}
                    <a href="#" className="hover:text-primary transition-colors text-foreground">
                      ieee.fbc@socet.edu.in<br />
                      ieee.sc@socet.edu.in<br />
                      ieee.tr@socet.edu.in
                    </a>
                  </li>
                  <li className="text-muted-foreground">
                    <span className="font-medium text-foreground">Phone:</span> <span className="text-foreground">+91 79660 46304</span>
                  </li>
                  <li className="text-muted-foreground">
                    <span className="font-medium text-foreground">Location:</span> <span className="text-foreground">EA-820,E-block 8<sup>th</sup>floor, Silver Oak University</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageLayout>
  );
}