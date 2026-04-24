import React, { useState, useRef } from "react";
import { SHEETS_WEBHOOK_URL, SHEETS_SECRET } from "@/config/sheets";
import PageLayout from "@/components/PageLayout";
import { TypingAnimation } from "@/components/TypingAnimation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useLatencyTracker } from "@/hooks/useLatencyTracker";

export default function Join() {
  useLatencyTracker("JoinPage");
  const [isLoading, setIsLoading] = useState(false);
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;

    const name = (form.querySelector("#name") as HTMLInputElement)?.value.trim();
    const email = (form.querySelector("#email") as HTMLInputElement)?.value.trim();
    const phone = (form.querySelector("#phone") as HTMLInputElement)?.value.trim();
    const enrollment = (form.querySelector("#enrollment") as HTMLInputElement)?.value.trim();
    const college = (form.querySelector("#college") as HTMLInputElement)?.value.trim();
    const reason = (form.querySelector("#reason") as HTMLTextAreaElement)?.value.trim();

    if (!name || !email) {
      toast.error("Please fill in your name and email.");
      return;
    }

    setIsLoading(true);
    try {
      await fetch(SHEETS_WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret: SHEETS_SECRET,
          type: "Join IEEE",
          values: {
            name,
            email,
            phone,
            enrollment,
            college,
            department,
            semester,
            academicYear,
            reason
          }
        }),
      });

      toast.success("Application submitted! We'll contact you soon.");
      form.reset();
      setDepartment("");
      setSemester("");
      setAcademicYear("");
    } catch (err: any) {
      console.error("[Submission] Failure:", err);
      toast.error("Failed to submit application.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout showFooter>
      <main className="pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Join IEEE SOU SB</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              <TypingAnimation text={"Get access to cutting-edge information, networking opportunities, career enhancement, and other exclusive member benefits."} />
            </p>
          </div>

          <div className="rounded-lg p-8 border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-900 transition-all duration-300 hover:shadow-[0_0_32px_rgba(59,130,246,0.18)] hover:border-blue-200 dark:hover:border-blue-800">
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Your full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Your email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="Your phone number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="enrollment">Enrollment Number</Label>
                  <Input id="enrollment" placeholder="Your enrollment number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="college">College</Label>
                  <Input id="college" placeholder="SOCET or ASOIT" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Engineering">Computer Engineering</SelectItem>
                      <SelectItem value="Information Technology">Information Technology</SelectItem>
                      <SelectItem value="Electronics & Communication">Electronics &amp; Communication</SelectItem>
                      <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                      <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                      <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Select value={semester} onValueChange={setSemester}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <SelectItem key={sem} value={`Semester ${sem}`}>
                          Semester {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Academic Year</Label>
                  <Select value={academicYear} onValueChange={setAcademicYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="First Year">First Year</SelectItem>
                      <SelectItem value="Second Year">Second Year</SelectItem>
                      <SelectItem value="Third Year">Third Year</SelectItem>
                      <SelectItem value="Fourth Year">Fourth Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Why do you want to join IEEE?</Label>
                <Textarea
                  id="reason"
                  placeholder="Tell us why you're interested in joining IEEE SOU SB"
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full h-12" disabled={isLoading}>
                {isLoading ? "Submitting…" : "Submit Application"}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </PageLayout>
  );
}
