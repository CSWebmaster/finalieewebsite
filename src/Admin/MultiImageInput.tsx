import React from "react";
import { Plus, X, Image as ImageIcon } from "lucide-react";

interface MultiImageInputProps {
  images: string[];
  onChange: (images: string[]) => void;
  label?: string;
}

const MultiImageInput: React.FC<MultiImageInputProps> = ({
  images,
  onChange,
  label = "Images",
}) => {
  const handleChange = (index: number, value: string) => {
    const updated = [...images];
    updated[index] = value;
    onChange(updated);
  };

  const handleAdd = () => {
    // Only add if the last field is non-empty
    if (images.length === 0 || images[images.length - 1].trim() !== "") {
      onChange([...images, ""]);
    }
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated.length === 0 ? [""] : updated);
  };

  const canAdd =
    images.length === 0 || images[images.length - 1].trim() !== "";

  // Ensure at least one field
  const displayImages = images.length === 0 ? [""] : images;

  return (
    <div className="mb-4">
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <div className="space-y-2">
        {displayImages.map((url, index) => (
          <div key={index} className="space-y-1">
            <div className="flex gap-2 items-center">
              <input
                type="url"
                className="flex-1 border border-gray-300 rounded-md shadow-sm px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Image URL ${index + 1}`}
                value={url}
                onChange={(e) => handleChange(index, e.target.value)}
              />
              {displayImages.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {/* Image preview */}
            {url.trim() && (
              <div className="ml-0 border border-gray-100 rounded-md overflow-hidden bg-gray-50 flex items-center justify-center h-24">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove("hidden");
                  }}
                />
                <div className="hidden flex-col items-center text-gray-400 text-xs gap-1">
                  <ImageIcon className="h-5 w-5" />
                  <span>Invalid URL</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={handleAdd}
        disabled={!canAdd}
        className="mt-2 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
      >
        <Plus className="h-4 w-4" />
        Add Image
      </button>
      <p className="text-xs text-gray-400 mt-1">
        First image shown on cards. All images shown in detail view.
      </p>
    </div>
  );
};

export default MultiImageInput;
