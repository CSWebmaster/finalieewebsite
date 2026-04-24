import React, { useState, useEffect } from "react";
import { serverTimestamp } from "firebase/firestore";
import MultiImageInput from "./MultiImageInput";
import { useAuth } from "../hooks/useAuth";
import { submitContentChange } from "../lib/cms-service";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: any;
  setSuccess: (message: string) => void;
  setError: (message: string) => void;
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, event, setSuccess, setError }) => {
  const { userData } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [eventName, setEventName] = useState<string>("");
  const [eventDate, setEventDate] = useState<string>("");
  const [eventTime, setEventTime] = useState<string>("");
  const [eventDescription, setEventDescription] = useState<string>("");
  const [eventSpeakers, setEventSpeakers] = useState<string>("");
  const [images, setImages] = useState<string[]>([""]);  // multi-image
  const [eventVenue, setEventVenue] = useState<string>("");
  const [eventCategory, setEventCategory] = useState<string>("Technical Event");
  const [eventYear, setEventYear] = useState<number>(new Date().getFullYear());
  const [eventLearnMore, setEventLearnMore] = useState<string>("");
  const [isUpcoming, setIsUpcoming] = useState<boolean>(false);
  const [registrationEnabled, setRegistrationEnabled] = useState<boolean>(false);
  const [registrationFormId, setRegistrationFormId] = useState<string>("");
  const [registrationLink, setRegistrationLink] = useState<string>("");

  useEffect(() => {
    if (event) {
      setEventName(event.name || "");
      setEventDate(event.date || "");
      setEventTime(event.time || "");
      setEventDescription(event.description || "");
      setEventSpeakers(event.speakers || "");
      // Support both old (image: string) and new (images: string[]) format
      if (event.images?.length > 0) {
        setImages(event.images);
      } else if (event.image) {
        setImages([event.image]);
      } else {
        setImages([""]);
      }
      setEventVenue(event.venue || "");
      setEventCategory(event.category || "Technical Event");
      setEventYear(event.year || new Date().getFullYear());
      setEventLearnMore(event.learnMore || "");
      setIsUpcoming(event.isUpcoming || false);
      setRegistrationEnabled(event.registrationEnabled || false);
      setRegistrationFormId(event.registrationFormId || "");
      setRegistrationLink(event.registrationLink || "");
    } else {
      resetEventForm();
    }
  }, [event]);

  const resetEventForm = () => {
    setEventName("");
    setEventDate("");
    setEventTime("");
    setEventDescription("");
    setEventSpeakers("");
    setImages([""]);
    setEventVenue("");
    setEventCategory("Technical Event");
    setEventYear(new Date().getFullYear());
    setEventLearnMore("");
    setIsUpcoming(false);
    setRegistrationEnabled(false);
    setRegistrationFormId("");
    setRegistrationLink("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Derive year from date if not provided
      const yearFromDate = eventDate ? new Date(eventDate).getFullYear() : eventYear;
      const cleanImages = images.map(i => i.trim()).filter(i => i !== "");

      const eventData = {
        name: eventName,
        date: eventDate,
        time: eventTime,
        description: eventDescription,
        speakers: eventSpeakers,
        // Store both for backward compat: image = first, images = all
        image: cleanImages[0] || "",
        images: cleanImages,
        venue: eventVenue,
        category: eventCategory,
        year: yearFromDate,
        learnMore: eventLearnMore,
        isUpcoming: isUpcoming,
        registrationEnabled: registrationEnabled,
        registrationFormId: registrationFormId,
        registrationLink: registrationLink,
        ...(event ? {} : { createdAt: serverTimestamp() }),
        updatedAt: serverTimestamp(),
      };

      if (!userData) throw new Error("Authentication required.");

      await submitContentChange(
        userData.uid,
        userData.name || userData.displayName || "Unknown",
        "events",
        eventData,
        event?.id || null,
        userData.email,
        userData.role
      );

      setSuccess(event ? "Update request submitted for approval!" : "New event submitted for approval!");
      resetEventForm();
      onClose();
    } catch (err: any) {
      setError(`Error ${event ? 'updating' : 'adding'} event: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">{event ? 'Edit' : 'Add New'} Event</h3>
            <button className="text-gray-600 hover:text-gray-800" onClick={onClose}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Event Name */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Event Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Annual Tech Conference"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                required
              />
            </div>

            {/* isUpcoming Toggle */}
            <div className="mb-4 flex items-center gap-3">
              <input
                type="checkbox"
                id="isUpcoming"
                className="w-4 h-4 accent-blue-600 cursor-pointer"
                checked={isUpcoming}
                onChange={(e) => setIsUpcoming(e.target.checked)}
              />
              <label htmlFor="isUpcoming" className="block text-gray-700 font-medium cursor-pointer">
                Mark as Upcoming Event
              </label>
            </div>

            {/* Registration System */}
            <div className="mb-4 p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="regEnabled"
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                  checked={registrationEnabled}
                  onChange={(e) => setRegistrationEnabled(e.target.checked)}
                />
                <label htmlFor="regEnabled" className="block text-gray-700 font-bold cursor-pointer text-sm">
                  Enable Event Registration
                </label>
              </div>

              {registrationEnabled && (
                <div className="animate-in slide-in-from-top-1 duration-200">
                  <label className="block text-gray-600 text-xs font-semibold mb-1 uppercase tracking-wider">Registration Form ID (Optional)</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., workshop-registration-2026"
                    value={registrationFormId}
                    onChange={(e) => setRegistrationFormId(e.target.value)}
                  />
                  <p className="text-[10px] text-blue-500 mt-1">If left blank, a default registration form will be used.</p>
                </div>
              )}

              {registrationEnabled && (
                <div className="animate-in slide-in-from-top-1 duration-200 delay-75">
                  <label className="block text-gray-600 text-xs font-semibold mb-1 uppercase tracking-wider">External Registration Link (Optional)</label>
                  <input
                    type="url"
                    className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://forms.gle/..."
                    value={registrationLink}
                    onChange={(e) => setRegistrationLink(e.target.value)}
                  />
                  <p className="text-[10px] text-gray-400 mt-1">If provided, users will be redirected to this link for registration.</p>
                </div>
              )}
            </div>

            {/* Category — TASK 16 */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Event Category</label>
              <select
                className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={eventCategory}
                onChange={(e) => setEventCategory(e.target.value)}
              >
                <option value="Technical Event">Technical Event</option>
                <option value="Non Technical Event">Non Technical Event</option>
              </select>
            </div>

            {/* Date, Time, Year */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                  value={eventDate}
                  onChange={(e) => {
                    setEventDate(e.target.value);
                    if (e.target.value) setEventYear(new Date(e.target.value).getFullYear());
                  }}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Time</label>
                <input
                  type="time"
                  className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Year</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                  value={eventYear}
                  onChange={(e) => setEventYear(parseInt(e.target.value))}
                  min={2020}
                  max={2030}
                />
              </div>
            </div>

            {/* Venue */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Venue</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Main Auditorium, Silver Oak University"
                value={eventVenue}
                onChange={(e) => setEventVenue(e.target.value)}
              />
            </div>

            {/* Images — Multi-image support */}
            <MultiImageInput
              images={images}
              onChange={setImages}
              label="Event Images"
            />

            {/* Description */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Description</label>
              <textarea
                className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                placeholder="Event description..."
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                required
              />
            </div>

            {/* Learn More Content */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Learn More Content</label>
              <textarea
                className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500 h-40"
                placeholder="Detailed content that will be displayed when 'Learn More' is clicked. You can include HTML formatting, images, and rich content here..."
                value={eventLearnMore}
                onChange={(e) => setEventLearnMore(e.target.value)}
              />
              <p className="text-gray-500 text-sm mt-1">This content will be displayed on a separate page when users click "Learn More"</p>
            </div>

            {/* Speakers */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Speakers</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Dr. Jane Smith, Prof. John Doe"
                value={eventSpeakers}
                onChange={(e) => setEventSpeakers(e.target.value)}
              />
              <p className="text-gray-500 text-sm mt-1">Separate multiple speakers with commas</p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={loading}
              >
                {loading ? "Submitting..." : (event ? "Propose Update" : "Submit for Approval")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
