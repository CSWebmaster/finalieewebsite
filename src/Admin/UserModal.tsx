import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db } from "../firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  setSuccess: (message: string) => void;
  setError: (message: string) => void;
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  user,
  setSuccess,
  setError,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    enrollment_number: "",
    role: "writer" as "admin" | "writer",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        enrollment_number: user.enrollment_number || "",
        role: user.role || "writer",
        password: user.password || "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        enrollment_number: "",
        role: "writer",
        password: "",
      });
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Extract enrollment from email if empty
      let enrollment = formData.enrollment_number;
      if (!enrollment && formData.email) {
        enrollment = formData.email.split('@')[0];
      }

      const userData = {
        name: formData.name,
        email: formData.email,
        enrollment_number: enrollment,
        role: formData.role,
        password: formData.password, // Added password field
      };

      // Document ID is the email address
      const docRef = doc(db, "users", formData.email.toLowerCase());
      
      if (user) {
        // Update existing user
        await updateDoc(docRef, userData);
        setSuccess("User updated successfully!");
      } else {
        // Add new user
        await setDoc(docRef, userData);
        setSuccess("User added successfully!");
      }
      onClose();
    } catch (err: any) {
      console.error("Error saving user:", err);
      setError(`Error saving user: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Add New User"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
              placeholder="john@example.com"
              required
              disabled={!!user} // Email is the ID, so it shouldn't be changed after creation
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              required={!user}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="enrollment">Enrollment Number</Label>
            <Input
              id="enrollment"
              value={formData.enrollment_number}
              onChange={(e) => setFormData({ ...formData, enrollment_number: e.target.value })}
              placeholder="123456"
            />
            <p className="text-[10px] text-muted-foreground">Leaves empty to extract from email prefix</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value: "admin" | "writer") =>
                setFormData({ ...formData, role: value })
              }
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="writer">Writer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#00629B]">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserModal;
