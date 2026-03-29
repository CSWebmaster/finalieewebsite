import React from "react";

interface ImageUrlInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
}

const ImageUrlInput: React.FC<ImageUrlInputProps> = ({ value, onChange, label, placeholder }) => {
  // Image validation function
  const isValidImageUrl = (url: string): boolean => {
    if (!url) return false;
    return url.match(/\.(jpeg|jpg|gif|png|webp)$/) !== null;
  };

  return (
    <div className="mb-4">
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <input
        type="url"
        className="w-full border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
      
      {value && (
        <div className="mt-2">
          <p className="text-sm text-gray-500 mb-1">Image Preview:</p>
          <div className="border rounded-md overflow-hidden bg-gray-100 flex items-center justify-center" style={{ height: "150px" }}>
            {isValidImageUrl(value) ? (
              <img loading="lazy" 
                src={value} 
                alt="Preview" 
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='18' y1='6' x2='6' y2='18'%3E%3C/line%3E%3Cline x1='6' y1='6' x2='18' y2='18'%3E%3C/line%3E%3C/svg%3E";
                  e.currentTarget.style.padding = "50px";
                }}
              />
            ) : (
              <div className="text-gray-400 flex flex-col items-center p-4">
                <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span>Enter a valid image URL</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUrlInput;