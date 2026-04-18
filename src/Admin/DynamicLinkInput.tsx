import React from "react";
import { Plus, X } from "lucide-react";

interface DynamicLinkInputProps {
  links: string[];
  onChange: (links: string[]) => void;
  label: string;
  placeholder?: string;
  type?: "url" | "text";
  validateFn?: (link: string) => string | null; // returns error message if invalid, null if valid
}

const DynamicLinkInput: React.FC<DynamicLinkInputProps> = ({
  links,
  onChange,
  label,
  placeholder = "https://...",
  type = "url",
  validateFn,
}) => {
  const handleChange = (index: number, value: string) => {
    const updated = [...links];
    updated[index] = value;
    onChange(updated);
  };

  const handleAdd = () => {
    if (links.length === 0 || links[links.length - 1].trim() !== "") {
      onChange([...links, ""]);
    }
  };

  const handleRemove = (index: number) => {
    const updated = links.filter((_, i) => i !== index);
    onChange(updated.length === 0 ? [] : updated);
  };

  const canAdd =
    links.length === 0 || links[links.length - 1].trim() !== "";

  const displayLinks = links.length === 0 ? [""] : links;

  return (
    <div className="mb-4">
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <div className="space-y-2">
        {displayLinks.map((link, index) => {
          const errorMsg = validateFn && link.trim() !== "" ? validateFn(link) : null;
          return (
            <div key={index} className="flex flex-col gap-1">
              <div className="flex gap-2 items-center">
                <input
                  type={type}
                  className={`flex-1 border rounded-md shadow-sm px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 ${
                    errorMsg ? "border-red-500 text-red-700 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder={`${placeholder} ${index + 1}`}
                  value={link}
                  onChange={(e) => handleChange(index, e.target.value)}
                />
                {displayLinks.length > 1 || link.trim() ? (
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
                    title="Remove"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
              {errorMsg && (
                <span className="text-xs text-red-500 ml-1 font-medium">{errorMsg}</span>
              )}
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={handleAdd}
        disabled={!canAdd}
        className="mt-2 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
      >
        <Plus className="h-4 w-4" />
        Add {label}
      </button>
    </div>
  );
};

export default DynamicLinkInput;
