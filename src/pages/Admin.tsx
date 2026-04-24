import React, { useState, useEffect, lazy, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import ForcePasswordChange from "@/components/ForcePasswordChange";

// ── Webmaster-only sections
import AwardModal from "../Admin/AwardModal";
import AwardPreviewList from "../Admin/AwardPreviewList";
import EventModal from "../Admin/EventModal";
import EventPreviewList from "../Admin/EventPreviewList";
import MemberModal from "../Admin/MemberModal";
import MemberPreviewList from "../Admin/MemberPreviewList";
import JourneyPreviewList from "../Admin/JourneyPreviewList";
import SIGPreviewList from "../Admin/SIGPreviewList";
import BlogModal from "../Admin/BlogModal";
import BlogPreviewList from "../Admin/BlogPreviewList";
import Dashboard from "../Admin/Dashboard";
import AdminLayout from "../Admin/AdminLayout";
import UserManagement from "../Admin/UserManagement";
import PendingApprovals from "../Admin/PendingApprovals";
import AuditHistory from "../Admin/AuditHistory";
import FormManagement from "../Admin/FormManagement";
import FormResponses from "../Admin/FormResponses";
// import DataMigration from "../Admin/DataMigration"; (Removed)

// ── Core member panel
import SubmitChange from "../Admin/SubmitChange";
import MySubmissions from "../Admin/MySubmissions";

import { Alert, AlertDescription } from "@/components/ui/alert";

// ────────────────────────────────────────────────────────────────────────────
const Admin = () => {
  const { userData, loading, isWebmaster, isCoreMember, isAdmin, isWriter } =
    useAuth();

  const [activeTab, setActiveTab]         = useState<string>("dashboard");
  const [showEventModal, setShowEventModal]   = useState(false);
  const [showAwardModal, setShowAwardModal]   = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showBlogModal, setShowBlogModal]     = useState(false);
  const [selectedEvent, setSelectedEvent]     = useState<any>(null);
  const [selectedAward, setSelectedAward]     = useState<any>(null);
  const [selectedMember, setSelectedMember]   = useState<any>(null);
  const [selectedBlog, setSelectedBlog]       = useState<any>(null);
  const [successMessage, setSuccessMessage]   = useState("");
  const [errorMessage, setErrorMessage]       = useState("");

  // Clear toast messages
  useEffect(() => {
    if (successMessage || errorMessage) {
      const t = setTimeout(() => { setSuccessMessage(""); setErrorMessage(""); }, 4000);
      return () => clearTimeout(t);
    }
  }, [successMessage, errorMessage]);

  // ── Loading ──────────────────────────────────────────────────────────────
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

  // ── Not authorised ───────────────────────────────────────────────────────
  if (!userData || (!isWebmaster && !isCoreMember)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4 text-center">
        <div className="max-w-md p-8 rounded-2xl border border-red-900/50 bg-red-950/20 backdrop-blur-xl">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Unauthorized</h1>
          <p className="text-slate-400 mb-6">
            Your account does not have access to the admin panel. Contact a Webmaster.
          </p>
          <Button onClick={() => (window.location.href = "/login")}>Back to Login</Button>
        </div>
      </div>
    );
  }

  // ── First-login: force password change ──────────────────────────────────
  if (isCoreMember && userData.mustChangePassword) {
    return (
      <ForcePasswordChange
        uid={userData.uid}
        email={userData.email}
        onComplete={() => window.location.reload()}
      />
    );
  }

  // ── Navigation helper ────────────────────────────────────────────────────
  const handleNavigate = (section: string) => {
    const tabMap: Record<string, string> = {
      events: "events", 
      awards: "awards", 
      members: "members",
      journey: "journey", 
      users: "users", 
      approvals: "approvals", 
      history: "history", 
      submit: "submit", 
      "my-submissions": "my-submissions", 
      mysubmissions: "my-submissions",
    };
    if (tabMap[section]) { setActiveTab(tabMap[section]); return; }

    const modalMap: Record<string, () => void> = {
      addEvent:  () => { setSelectedEvent(null);  setShowEventModal(true); },
      addAward:  () => { setSelectedAward(null);  setShowAwardModal(true); },
      addMember: () => { setSelectedMember(null); setShowMemberModal(true); },
    };
    modalMap[section]?.();
  };

  // ── Edit handlers ────────────────────────────────────────────────────────
  const handleEditEvent  = (e: any) => { setSelectedEvent(e);  setShowEventModal(true); };
  const handleEditAward  = (a: any) => { setSelectedAward(a);  setShowAwardModal(true); };
  const handleEditMember = (m: any) => { setSelectedMember(m); setShowMemberModal(true); };
  const handleEditBlog   = (b: any) => { setSelectedBlog(b);   setShowBlogModal(true); };

  // ── Core Member panel — same AdminLayout, filtered tabs ─────────────────
  if (isCoreMember) {
    // Build visible tabs from the core member's permissions array
    const perms: string[] = userData.permissions || ['events', 'awards', 'members', 'blogs', 'sigs', 'journey'];

    return (
      <AdminLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userRole="core_member"
        visibleTabs={perms}
      >
        {/* Pending submission banner at top of every page */}
        <div className="mb-4 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 flex items-center gap-2">
          ⚠ <strong>Core Member Mode</strong> — All changes you save will be submitted for Webmaster approval before appearing on the website.
        </div>

        {successMessage && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}
        {errorMessage && (
          <Alert className="mb-4" variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <Dashboard
            navigateTo={handleNavigate}
            userRole="core_member"
            userEmail={userData.email}
            setSelectedEvent={setSelectedEvent}
            setSelectedAward={setSelectedAward}
            setSelectedMember={setSelectedMember}
          />
        )}

        {/* Permitted content tabs — same components, modals route to pendingChanges */}
        {activeTab === "events" && perms.includes("events") && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Events</h2>
              <Button onClick={() => { setSelectedEvent(null); setShowEventModal(true); }}>
                Propose New Event
              </Button>
            </div>
            <EventPreviewList onEdit={handleEditEvent} setSuccess={setSuccessMessage} setError={setErrorMessage} />
          </div>
        )}

        {activeTab === "awards" && perms.includes("awards") && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Achievements</h2>
              <Button onClick={() => { setSelectedAward(null); setShowAwardModal(true); }}>
                Propose New Achievement
              </Button>
            </div>
            <AwardPreviewList onEdit={handleEditAward} setSuccess={setSuccessMessage} setError={setErrorMessage} />
          </div>
        )}

        {activeTab === "members" && perms.includes("members") && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Team</h2>
              <Button onClick={() => { setSelectedMember(null); setShowMemberModal(true); }}>
                Propose New Member
              </Button>
            </div>
            <MemberPreviewList onEdit={handleEditMember} setSuccess={setSuccessMessage} setError={setErrorMessage} />
          </div>
        )}

        {activeTab === "blogs"   && perms.includes("blogs")   && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Blogs</h2>
              <Button onClick={() => { setSelectedBlog(null); setShowBlogModal(true); }}>
                Propose New Blog
              </Button>
            </div>
            <BlogPreviewList onEdit={handleEditBlog} setSuccess={setSuccessMessage} setError={setErrorMessage} />
          </div>
        )}

        {activeTab === "journey" && perms.includes("journey") && <div className="space-y-6"><JourneyPreviewList /></div>}
        {activeTab === "sigs"    && perms.includes("sigs")    && <div className="space-y-6"><SIGPreviewList /></div>}

        {/* My Submissions — always available for core members */}
        {activeTab === "my-submissions" && <MySubmissions />}

        {/* Modals — these call submitContentChange → pendingChanges */}
        {showEventModal  && <EventModal  isOpen event={selectedEvent}  onClose={() => { setShowEventModal(false);  setSelectedEvent(null);  }} setSuccess={setSuccessMessage} setError={setErrorMessage} />}
        {showAwardModal  && <AwardModal  isOpen award={selectedAward}  onClose={() => { setShowAwardModal(false);  setSelectedAward(null);  }} setSuccess={setSuccessMessage} setError={setErrorMessage} />}
        {showMemberModal && <MemberModal isOpen member={selectedMember} onClose={() => { setShowMemberModal(false); setSelectedMember(null); }} setSuccess={setSuccessMessage} setError={setErrorMessage} />}
        {showBlogModal   && <BlogModal   isOpen blog={selectedBlog}    onClose={() => { setShowBlogModal(false);   setSelectedBlog(null);   }} setSuccess={setSuccessMessage} setError={setErrorMessage} />}
      </AdminLayout>
    );
  }


  // ── Webmaster panel (full) ───────────────────────────────────────────────
  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {successMessage && (
        <Alert className="mb-4 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      {errorMessage && (
        <Alert className="mb-4" variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {activeTab === "dashboard" && (
        <Dashboard
          navigateTo={handleNavigate}
          userRole="webmaster"
          userEmail={userData.email}
          setSelectedEvent={setSelectedEvent}
          setSelectedAward={setSelectedAward}
          setSelectedMember={setSelectedMember}
        />
      )}

      {activeTab === "events" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Events Management</h2>
            <Button onClick={() => { setSelectedEvent(null); setShowEventModal(true); }}>Add New Event</Button>
          </div>
          <EventPreviewList onEdit={handleEditEvent} setSuccess={setSuccessMessage} setError={setErrorMessage} />
        </div>
      )}

      {activeTab === "upcoming" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Upcoming Events</h2>
            <Button onClick={() => { setSelectedEvent(null); setShowEventModal(true); }}>Add New Event</Button>
          </div>
          <EventPreviewList onEdit={handleEditEvent} setSuccess={setSuccessMessage} setError={setErrorMessage} />
        </div>
      )}

      {activeTab === "awards" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Achievements Management</h2>
            <Button onClick={() => { setSelectedAward(null); setShowAwardModal(true); }}>Add Achievement</Button>
          </div>
          <AwardPreviewList onEdit={handleEditAward} setSuccess={setSuccessMessage} setError={setErrorMessage} />
        </div>
      )}

      {activeTab === "members" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Team Management</h2>
            <Button onClick={() => { setSelectedMember(null); setShowMemberModal(true); }}>Add Member</Button>
          </div>
          <MemberPreviewList onEdit={handleEditMember} setSuccess={setSuccessMessage} setError={setErrorMessage} />
        </div>
      )}

      {activeTab === "journey"  && <div className="space-y-6"><JourneyPreviewList /></div>}
      {activeTab === "sigs"     && <div className="space-y-6"><SIGPreviewList /></div>}

      {activeTab === "blogs" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Blog Management</h2>
            <Button onClick={() => { setSelectedBlog(null); setShowBlogModal(true); }}>Add Blog</Button>
          </div>
          <BlogPreviewList onEdit={handleEditBlog} setSuccess={setSuccessMessage} setError={setErrorMessage} />
        </div>
      )}

      {/* Webmaster-only tabs */}
      {activeTab === "approvals" && <PendingApprovals />}
      {activeTab === "users"     && <UserManagement />}
      {activeTab === "history"   && <AuditHistory />}
      {activeTab === "forms"     && <FormManagement />}
      {activeTab === "submissions" && <FormResponses />}
      {/* {activeTab === "migration" && <DataMigration />} */}

      {/* Modals */}
      {showEventModal  && <EventModal  isOpen event={selectedEvent}  onClose={() => { setShowEventModal(false);  setSelectedEvent(null);  }} setSuccess={setSuccessMessage} setError={setErrorMessage} />}
      {showAwardModal  && <AwardModal  isOpen award={selectedAward}  onClose={() => { setShowAwardModal(false);  setSelectedAward(null);  }} setSuccess={setSuccessMessage} setError={setErrorMessage} />}
      {showMemberModal && <MemberModal isOpen member={selectedMember} onClose={() => { setShowMemberModal(false); setSelectedMember(null); }} setSuccess={setSuccessMessage} setError={setErrorMessage} />}
      {showBlogModal   && <BlogModal   isOpen blog={selectedBlog}    onClose={() => { setShowBlogModal(false);   setSelectedBlog(null);   }} setSuccess={setSuccessMessage} setError={setErrorMessage} />}
    </AdminLayout>
  );
};

export default Admin;
