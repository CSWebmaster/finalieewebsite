import React, { useState, useEffect } from "react";
import { serverTimestamp } from "firebase/firestore";
import ImageUrlInput from "./ImageUrlInput";
import { useAuth } from "../hooks/useAuth";
import { submitContentChange } from "../lib/cms-service";

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member?: any;
  setSuccess: (message: string) => void;
  setError: (message: string) => void;
}

const MemberModal: React.FC<MemberModalProps> = ({ isOpen, onClose, member, setSuccess, setError }) => {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [memberType, setMemberType] = useState("faculty");
  const [memberImage, setMemberImage] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberDesignation, setMemberDesignation] = useState("");
  const [memberDepartment, setMemberDepartment] = useState("");
  const [memberEducation, setMemberEducation] = useState("");
  const [memberLinkedin, setMemberLinkedin] = useState("");
  const [memberCommittee, setMemberCommittee] = useState("");
  const [memberSociety, setMemberSociety] = useState("");
  const [memberCorePosition, setMemberCorePosition] = useState("");
  const [memberExecutivePosition, setMemberExecutivePosition] = useState("");
  const [memberYear, setMemberYear] = useState("");
  const [memberDisplayOrder, setMemberDisplayOrder] = useState("");
  const [memberObjectPosition, setMemberObjectPosition] = useState("center 20%");

  useEffect(() => {
    if (member) {
      setMemberType(member.type || "faculty");
      setMemberImage(member.image || "");
      setMemberName(member.name || "");
      setMemberDesignation(member.designation || "");
      setMemberDepartment(member.department || "");
      setMemberEducation(member.education || "");
      setMemberLinkedin(member.linkedin || "");
      setMemberCommittee(member.committee || "");
      setMemberSociety(member.society || "");
      setMemberObjectPosition(member.objectPosition || "center 20%");

      // FIX: Load display order when editing
      setMemberDisplayOrder(member.displayOrder?.toString() || "");

      if (member.type === "core") {
        setMemberCorePosition(member.position || "");
      } else if (member.type === "executive") {
        setMemberExecutivePosition(member.position || "");
        setMemberYear(member.year?.toString() || "");
      }
    } else {
      resetMemberForm();
    }
  }, [member]);

  const resetMemberForm = () => {
    setMemberType("faculty");
    setMemberImage("");
    setMemberName("");
    setMemberDesignation("");
    setMemberDepartment("");
    setMemberEducation("");
    setMemberLinkedin("");
    setMemberCommittee("");
    setMemberSociety("");
    setMemberCorePosition("");
    setMemberExecutivePosition("");
    setMemberYear("");
    setMemberDisplayOrder(""); // FIX
    setMemberObjectPosition("center 20%");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const memberData: any = {
        type: memberType,
        image: memberImage,
        name: memberName,
        designation: memberDesignation,
        linkedin: memberLinkedin,
        displayOrder: Number(memberDisplayOrder) || 999,
        objectPosition: memberObjectPosition,
        updatedAt: serverTimestamp(),
        ...(member ? {} : { createdAt: serverTimestamp() }),
      };

      if (memberType === "faculty") {
        memberData.department = memberDepartment;
      } else {
        memberData.education = memberEducation;

        if (memberType === "executive") {
          memberData.position = memberExecutivePosition;
          memberData.society = memberSociety;
          memberData.year = Number(memberYear) || new Date().getFullYear();
        }

        if (memberType === "core") {
          memberData.position = memberCommittee === "Social Media Committee" ? "" : memberCorePosition;
          memberData.committee = memberCommittee;
        }
      }

      if (!userData) throw new Error("Authentication required.");

      await submitContentChange(
        userData.uid,
        userData.displayName || userData.name || "Unknown Admin",
        "members",
        memberData,
        member?.id || null,
        userData.email,
        userData.role
      );

      const isDirect = userData.role === 'webmaster';
      setSuccess(isDirect ? "Member updated successfully!" : "Change request submitted for review!");
      resetMemberForm();
      onClose();
    } catch (err: any) {
      setError(`Error ${member ? "updating" : "adding"} member: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const executiveRoles = ["Chairperson", "Vice-Chairperson", "Secretary", "Treasurer", "Webmaster"];
  const coreRoles = ["Chairperson", "Vice-Chairperson", "Interim Chairperson", "Interim Vice-Chairperson"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">{member ? "Edit" : "Add New"} Member</h3>
            <button className="text-gray-600 hover:text-gray-800" onClick={onClose}>✕</button>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Member Type */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Member Type</label>
              <select
                className="w-full border-gray-300 rounded-md px-4 py-2"
                value={memberType}
                onChange={(e) => setMemberType(e.target.value)}
                required
              >
                <option value="faculty">Faculty Member</option>
                <option value="advisory">Advisory Board Member</option>
                <option value="executive">Executive Committee Member</option>
                <option value="core">Core Committee Member</option>
                <option value="member">Member</option>
              </select>
            </div>

            <ImageUrlInput value={memberImage} onChange={setMemberImage} label="Image URL" placeholder="https://example.com/image.jpg" />

            <Input label="Name" value={memberName} onChange={setMemberName} placeholder="John Doe" required />
            {(memberType === "faculty" || memberType === "advisory") && (
              <Input label="Designation" value={memberDesignation} onChange={setMemberDesignation} placeholder="Professor" required />
            )}
            <Input label="LinkedIn Profile URL" value={memberLinkedin} onChange={setMemberLinkedin} placeholder="https://linkedin.com/in/johndoe" />

            {/* Display Order */}
            <Input
              label="Display Order"
              type="number"
              value={memberDisplayOrder}
              onChange={setMemberDisplayOrder}
              placeholder="1"
              required
            />

            {memberType === "faculty" && (
              <Input label="Department" value={memberDepartment} onChange={setMemberDepartment} placeholder="Computer Science" required />
            )}

            {memberType === "executive" && (
              <>
                <Dropdown label="Society" value={memberSociety} onChange={setMemberSociety} options={["SB", "WIE", "SIGHT", "SPS", "CS"]} />
                <Dropdown label="Position" value={memberExecutivePosition} onChange={setMemberExecutivePosition} options={executiveRoles} />
                <Input label="Year" value={memberYear} onChange={setMemberYear} placeholder="2024" required />
              </>
            )}

            {memberType === "core" && (
              <>
                <Dropdown label="Committee" value={memberCommittee} onChange={setMemberCommittee} options={["Management Committee", "Curation Committee", "Content Committee", "Creative Committee", "Outreach Committee", "Technical Committee", "Social Media Committee"]} />
                {memberCommittee !== "Social Media Committee" && (
                  <Dropdown label="Position" value={memberCorePosition} onChange={setMemberCorePosition} options={coreRoles} />
                )}
              </>
            )}

            {memberType !== "faculty" && (
              <Input label="Education (optional)" value={memberEducation} onChange={setMemberEducation} placeholder="Ph.D. in Computer Science" />
            )}

            {/* Interactive Image Framer */}
            <ImageFramer 
              imageUrl={memberImage}
              initialPosition={memberObjectPosition}
              onChange={setMemberObjectPosition}
            />

            <div className="flex justify-end space-x-3 mt-8">
              <button type="button" className="px-4 py-2 border rounded-md" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md" disabled={loading}>
                {loading ? "Saving..." : member ? "Update Member" : "Save Member"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

// ── HELPERS for Manual Photo Framer (Instagram Style) ──
const ImageFramer = ({ imageUrl, initialPosition = "50% 50%", onChange }: any) => {
  const cleanInitial = initialPosition.includes('%') ? initialPosition : "50% 50%";
  const [position, setPosition] = React.useState(cleanInitial);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  React.useEffect(() => {
    if (initialPosition) setPosition(initialPosition);
  }, [initialPosition]);

  const handleInteract = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Map mouse position within the circle directly to the 0-100% focus range
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));
    
    const newPos = `${Math.round(clampedX)}% ${Math.round(clampedY)}%`;
    setPosition(newPos);
    onChange(newPos);
  };

  if (!imageUrl) return null;

  return (
    <div className="mt-8 mb-10 flex flex-col items-center">
      <div className="text-center mb-6">
         <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Configure Profile Frame</h4>
         <p className="text-[11px] text-slate-500 font-medium mt-1">Click and drag inside the circle to adjust the photo focus</p>
      </div>

      <div className="relative group">
        {/* THE INTERACTIVE APERTURE (Square - Matching Website) */}
        <div 
          ref={containerRef}
          className="relative w-48 h-48 rounded-xl overflow-hidden cursor-move border-[4px] border-white dark:border-slate-800 shadow-2xl transition-transform active:scale-[0.98] select-none"
          onMouseDown={(e) => { setIsDragging(true); handleInteract(e.clientX, e.clientY); }}
          onMouseMove={(e) => isDragging && handleInteract(e.clientX, e.clientY)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
        >
          {/* THE IMAGE BEHIND THE FRAME */}
          <img 
            src={imageUrl} 
            className="w-full h-full object-cover pointer-events-none" 
            style={{ objectPosition: position }} 
            alt="Adjustable Profile"
          />

          {/* Rule of Thirds Guide (Visible during drag) */}
          <div className={`absolute inset-0 pointer-events-none border-[1px] border-white/30 grid grid-cols-3 grid-rows-3 transition-opacity duration-300 ${isDragging ? 'opacity-40' : 'opacity-0'}`}>
            <div className="border-[0.5px] border-white/20" />
            <div className="border-[0.5px] border-white/20" />
            <div className="border-[0.5px] border-white/20" />
            <div className="border-[0.5px] border-white/20" />
          </div>

          <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${isDragging ? 'opacity-100' : 'opacity-0'}`}>
             <div className="w-10 h-10 border-2 border-white/80 rounded-xl flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full shadow-lg" />
             </div>
          </div>
        </div>

        {/* Floating coordinates badge */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-mono rounded-full border border-white/10 shadow-lg">
           {position}
        </div>
      </div>

      <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
         <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
         <p className="text-[10px] font-bold text-slate-500 uppercase">Live Result Preview</p>
      </div>
    </div>
  );
};

const Input = ({ label, value, onChange, placeholder, required = false, type = "text" }: any) => (
  <div className="mb-4">
    <label className="block text-gray-700 font-medium mb-2">{label}</label>
    <input
      type={type}
      className="w-full border-gray-300 rounded-md px-4 py-2"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
    />
  </div>
);

const Dropdown = ({ label, value, onChange, options, isObjectOptions = false }: any) => (
  <div className="mb-4">
    <label className="block text-gray-700 font-medium mb-2">{label}</label>
    <select
      className="w-full border-gray-300 rounded-md px-4 py-2"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
    >
      <option value="">Select {label}</option>
      {options.map((opt: any) => (
        <option key={isObjectOptions ? opt.value : opt} value={isObjectOptions ? opt.value : opt}>
          {isObjectOptions ? opt.label : opt}
        </option>
      ))}
    </select>
  </div>
);

export default MemberModal;