import React, { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, XCircle, AlertCircle, Eye } from "lucide-react";

const WriterDashboard = () => {
  const { userData } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData?.uid) return;

    const q = query(
      collection(db, "pendingChanges"),
      where("submittedBy", "==", userData.uid),
      orderBy("submittedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSubmissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return unsubscribe;
  }, [userData]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50"><CheckCircle2 className="w-3 h-3 mr-1" /> Published</Badge>;
      case "rejected":
        return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Clock className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-slate-900">Your Submissions</h2>
        <p className="text-slate-500 text-sm">Track the status of your content contributions.</p>
      </div>

      {submissions.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 text-slate-400">
            <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
            <p>You haven't submitted any content yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {submissions.map((sub) => (
            <Card key={sub.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="py-4 px-6 flex flex-row items-center justify-between border-b bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <Badge className="bg-slate-700 capitalize">{sub.section}</Badge>
                  <span className="text-xs text-slate-400">Submitted {sub.submittedAt?.toDate().toLocaleDateString()}</span>
                </div>
                {getStatusBadge(sub.status)}
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-1">{sub.data?.title || sub.data?.name || "Untitled Item"}</h4>
                    <p className="text-sm text-slate-500 line-clamp-2">
                      {sub.data?.description || sub.data?.content || "No preview available."}
                    </p>
                    
                    {sub.status === "rejected" && (sub.rejectionReason || sub.adminNotes) && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex gap-3 text-red-700">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold uppercase mb-1">Feedback from Admin</p>
                          <p className="text-sm">{sub.rejectionReason || sub.adminNotes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WriterDashboard;
