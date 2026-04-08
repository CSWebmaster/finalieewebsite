import React, { useState, useEffect } from "react";
import AwardModal from "../Admin/AwardModal";
import AwardPreviewList from "../Admin/AwardPreviewList";
import EventModal from "../Admin/EventModal";
import EventPreviewList from "../Admin/EventPreviewList";
import MemberModal from "../Admin/MemberModal";
import MemberPreviewList from "../Admin/MemberPreviewList";
import JourneyModal from "../Admin/JourneyModal";
import JourneyPreviewList from "../Admin/JourneyPreviewList";
import SIGPreviewList from "../Admin/SIGPreviewList";
import BlogModal from "../Admin/BlogModal";
import BlogPreviewList from "../Admin/BlogPreviewList";
import Dashboard from "../Admin/Dashboard";
import AdminLayout from "../Admin/AdminLayout";
import UserManagement from "../Admin/UserManagement";
import UserModal from "../Admin/UserModal";
import { useAuth } from "@/hooks/useAuth";
import { db } from "../firebase";
import { doc, deleteDoc, collection, addDoc, serverTimestamp } from "@/lib/firestore-client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Loader2, ShieldAlert } from "lucide-react";

const Admin = () => {
  const { userData, loading, isAdmin, isWriter } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedAward, setSelectedAward] = useState<any>(null);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    // Redirect writers if they somehow land on user tab
    if (isWriter && activeTab === 'users') {
      setActiveTab('dashboard');
    }
  }, [isWriter, activeTab]);

  // Navigation handler from dashboard to specific tabs
  const handleNavigate = (section: string) => {
    switch (section) {
      case 'events': 
        setActiveTab('events'); 
        break;
      case 'awards': 
        setActiveTab('awards'); 
        break;
      case 'members': 
        setActiveTab('members'); 
        break;
      case 'journey':
        setActiveTab('journey');
        break;
      case 'addEvent':
        setSelectedEvent(null);
        setShowEventModal(true);
        // Don't change tab when adding - keep current tab
        break;
      case 'addAward':
        setSelectedAward(null);
        setShowAwardModal(true);
        // Don't change tab when adding - keep current tab
        break;
      case 'addMember':
        setSelectedMember(null);
        setShowMemberModal(true);
        // Don't change tab when adding - keep current tab
        break;
      case 'users':
        setActiveTab('users');
        break;
      case 'addUser':
        setSelectedUser(null);
        setShowUserModal(true);
        break;
      default: 
        setActiveTab('dashboard');
    }
  };

  // Edit Handlers
  const handleEditEvent = (event: any) => { setSelectedEvent(event); setShowEventModal(true); };
  const handleEditAward = (award: any) => { setSelectedAward(award); setShowAwardModal(true); };
  const handleEditMember = (member: any) => { setSelectedMember(member); setShowMemberModal(true); };
  const handleEditUser = (user: any) => { setSelectedUser(user); setShowUserModal(true); };
  const handleEditBlog = (blog: any) => { setSelectedBlog(blog); setShowBlogModal(true); };

  // ACTIVITY LOGGING
  const logActivity = async (action: string, contentType: string, contentId: string, contentName: string) => {
    try {
      const email = userData?.email || "unknown";
      await addDoc(collection(db, "adminActivityLogs"), {
        action,
        contentType,
        contentId,
        contentName,
        adminEmail: email,
        timestamp: serverTimestamp(),
        role: userData?.role || 'unknown'
      });
    } catch (_) {
      console.warn("Could not log activity - check rules.");
    }
  };

  // Delete Handlers
  const handleDeleteEvent = async (id: string) => {
    if (!navigator.onLine) { setErrorMessage("No internet connection."); return; }
    try {
      await deleteDoc(doc(db, "events", id));
      await logActivity("deleted", "event", id, id);
      setSuccessMessage("Event deleted successfully.");
    } catch (err: any) {
      setErrorMessage(`Error deleting event: ${err.message}`);
    }
  };

  const handleDeleteAward = async (id: string) => {
    if (!navigator.onLine) { setErrorMessage("No internet connection."); return; }
    try {
      await deleteDoc(doc(db, "awards", id));
      await logActivity("deleted", "award", id, id);
      setSuccessMessage("Achievement deleted successfully.");
    } catch (err: any) {
      setErrorMessage(`Error deleting achievement: ${err.message}`);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!navigator.onLine) { setErrorMessage("No internet connection."); return; }
    try {
      await deleteDoc(doc(db, "members", id));
      await logActivity("deleted", "member", id, id);
      setSuccessMessage("Member deleted successfully.");
    } catch (err: any) {
      setErrorMessage(`Error deleting member: ${err.message}`);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!navigator.onLine) { setErrorMessage("No internet connection."); return; }
    try {
      await deleteDoc(doc(db, "blogs", id));
      await logActivity("deleted", "blog", id, id);
      setSuccessMessage("Blog deleted successfully.");
    } catch (err: any) {
      setErrorMessage(`Error deleting blog: ${err.message}`);
    }
  };

  // Clear messages after a timeout
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timeout = setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [successMessage, errorMessage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-[#00629B] animate-spin" />
          <p className="text-slate-400">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // Final safety check for Authorization
  if (!isAdmin && !isWriter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4 text-center">
        <div className="max-w-md p-8 rounded-2xl border border-red-900/50 bg-red-950/20 backdrop-blur-xl">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Unauthorized</h1>
          <p className="text-slate-400 mb-6">Your account role does not have access to the admin panel.</p>
          <Button onClick={() => window.location.href = "/login"}>Back to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {successMessage && (
        <Alert className="mb-4 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      {errorMessage && (
        <Alert className="mb-4 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800" variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Simple conditional rendering instead of Tabs to avoid conflicts */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <Dashboard
            navigateTo={handleNavigate}
            setSelectedEvent={setSelectedEvent}
            setSelectedAward={setSelectedAward}
            setSelectedMember={setSelectedMember}
          />
        </div>
      )}

      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Events Management</h2>
            <Button onClick={() => { setSelectedEvent(null); setShowEventModal(true); }}>
              Add New Event
            </Button>
          </div>
          <EventPreviewList
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
            setSuccess={setSuccessMessage}
            setError={setErrorMessage}
          />
        </div>
      )}

      {activeTab === 'upcoming' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Upcoming Events</h2>
            <Button onClick={() => { setSelectedEvent(null); setShowEventModal(true); }}>
              Add New Event
            </Button>
          </div>
          <EventPreviewList
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
            setSuccess={setSuccessMessage}
            setError={setErrorMessage}
          />
        </div>
      )}

      {activeTab === 'awards' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Achievements Management</h2>
            <Button onClick={() => { setSelectedAward(null); setShowAwardModal(true); }}>
              Add New Achievement
            </Button>
          </div>
          <AwardPreviewList
            onEdit={handleEditAward}
            onDelete={handleDeleteAward}
            setSuccess={setSuccessMessage}
            setError={setErrorMessage}
          />
        </div>
      )}

      {activeTab === 'members' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Team Management</h2>
            <Button onClick={() => { setSelectedMember(null); setShowMemberModal(true); }}>
              Add New Team Member
            </Button>
          </div>
          <MemberPreviewList
            onEdit={handleEditMember}
            onDelete={handleDeleteMember}
            setSuccess={setSuccessMessage}
            setError={setErrorMessage}
          />
        </div>
      )}

      {activeTab === 'journey' && (
        <div className="space-y-6">
          <JourneyPreviewList />
        </div>
      )}

      {activeTab === 'sigs' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">SIGs Management</h2>
          </div>
          <SIGPreviewList />
        </div>
      )}

      {activeTab === 'blogs' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Blog Management</h2>
            <Button onClick={() => { setSelectedBlog(null); setShowBlogModal(true); }}>
              Add New Blog
            </Button>
          </div>
          <BlogPreviewList
            onEdit={handleEditBlog}
            setSuccess={setSuccessMessage}
            setError={setErrorMessage}
          />
        </div>
      )}

      {activeTab === 'users' && isAdmin && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">User Access Management</h2>
            <Button onClick={() => { setSelectedUser(null); setShowUserModal(true); }}>
              Add New User
            </Button>
          </div>
          <UserManagement
            onEdit={handleEditUser}
            setSuccess={setSuccessMessage}
            setError={setErrorMessage}
          />
        </div>
      )}

      {/* Modals */}
      {showEventModal && (
        <EventModal
          isOpen={showEventModal}
          onClose={() => { setShowEventModal(false); setSelectedEvent(null); }}
          event={selectedEvent}
          setSuccess={setSuccessMessage}
          setError={setErrorMessage}
        />
      )}

      {showAwardModal && (
        <AwardModal
          isOpen={showAwardModal}
          onClose={() => { setShowAwardModal(false); setSelectedAward(null); }}
          award={selectedAward}
          setSuccess={setSuccessMessage}
          setError={setErrorMessage}
        />
      )}

      {showMemberModal && (
        <MemberModal
          isOpen={showMemberModal}
          onClose={() => { setShowMemberModal(false); setSelectedMember(null); }}
          member={selectedMember}
          setSuccess={setSuccessMessage}
          setError={setErrorMessage}
        />
      )}

      {showUserModal && (
        <UserModal
          isOpen={showUserModal}
          onClose={() => { setShowUserModal(false); setSelectedUser(null); }}
          user={selectedUser}
          setSuccess={setSuccessMessage}
          setError={setErrorMessage}
        />
      )}

      {showBlogModal && (
        <BlogModal
          isOpen={showBlogModal}
          onClose={() => { setShowBlogModal(false); setSelectedBlog(null); }}
          blog={selectedBlog}
          setSuccess={setSuccessMessage}
          setError={setErrorMessage}
        />
      )}

    </AdminLayout>
  );
};

export default Admin;

