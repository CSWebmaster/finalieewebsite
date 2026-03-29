import React, { useState, useEffect } from "react";
import { collection, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import ImageUrlInput from "./ImageUrlInput";

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member?: any;
  setSuccess: (message: string) => void;
  setError: (message: string) => void;
}

const MemberModal: React.FC<MemberModalProps> = ({ isOpen, onClose, member, setSuccess, setError }) => {
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
          memberData.position = memberCorePosition;
          memberData.committee = memberCommittee;
        }
      }

      if (member?.id) {
        await updateDoc(doc(db, "members", member.id), memberData);
        setSuccess("Member updated successfully!");
      } else {
        await addDoc(collection(db, "members"), memberData);
        setSuccess("Member added successfully!");
      }

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
            <Input label="Designation" value={memberDesignation} onChange={setMemberDesignation} placeholder="Professor" required />
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
                <Dropdown label="Committee" value={memberCommittee} onChange={setMemberCommittee} options={["Management Committee", "Curation Committee", "Content Committee", "Creative Committee", "Outreach Committee", "Technical Committee"]} />
                <Dropdown label="Position" value={memberCorePosition} onChange={setMemberCorePosition} options={coreRoles} />
              </>
            )}

            {memberType !== "faculty" && (
              <Input label="Education" value={memberEducation} onChange={setMemberEducation} placeholder="Ph.D. in Computer Science" required />
            )}

            <div className="flex justify-end space-x-3 mt-6">
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

const Dropdown = ({ label, value, onChange, options }: any) => (
  <div className="mb-4">
    <label className="block text-gray-700 font-medium mb-2">{label}</label>
    <select
      className="w-full border-gray-300 rounded-md px-4 py-2"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
    >
      <option value="">Select {label}</option>
      {options.map((opt: string) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

export default MemberModal;