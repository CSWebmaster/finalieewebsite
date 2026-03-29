import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft } from "lucide-react";
const MemberDetails = () => {
  const { id } = useParams();
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchMember = async () => {
      if (!id) {
        setError("No member ID provided");
        setLoading(false);
        return;
      }
      try {
        const memberDoc = await getDoc(doc(db, "members", id));
        if (memberDoc.exists()) {
          setMember({ id: memberDoc.id, ...memberDoc.data() });
        } else {
          setError("Member not found");
        }
      } catch (err: any) {
        console.error("Error fetching member:", err);
        setError(`Error fetching member: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchMember();
  }, [id]);
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="p-6">
            <h2 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">
              Error
            </h2>
            <p className="text-red-700 dark:text-red-400">{error}</p>
            <Button asChild className="mt-4">
              <Link to="/members">Back to Members</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  if (!member) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-medium mb-2">Member not found</h2>
            <p>The member you're looking for doesn't exist or has been removed.</p>
            <Button asChild className="mt-4">
              <Link to="/members">Back to Members</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  const getMemberTypeLabel = (type: string) => {
    switch (type) {
      case "faculty":
        return "Faculty Advisor";
      case "advisory":
        return "Advisory Board";
      case "executive":
        return "Executive Committee";
      case "core":
        return "Core Committee";
      case "member":
        return "Member";
      default:
        return "Member";
    }
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link to="/members" className="flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Members
        </Link>
      </Button>
      <div className="grid md:grid-cols-3 gap-6">
        {/* Member Image and Basic Info */}
        <Card className="md:col-span-1">
          <CardContent className="p-6 flex flex-col items-center">
            <Avatar className="h-32 w-32 mb-4">
              <AvatarImage src={member.image} alt={member.name} />
              <AvatarFallback className="text-2xl">
                {member.name?.charAt(0) || "M"}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-bold text-center">{member.name}</h1>
            <Badge variant="outline" className="mt-2">
              {getMemberTypeLabel(member.type)}
            </Badge>
            {member.position && (
              <p className="mt-2 text-center text-muted-foreground">
                {member.position}
              </p>
            )}
            {member.designation && (
              <p className="mt-1 text-center text-muted-foreground">
                {member.designation}
              </p>
            )}
            {member.linkedin && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                <svg
                  className="h-5 w-5 mr-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                LinkedIn Profile
              </a>
            )}
          </CardContent>
        </Card>
        {/* Member Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Member Details</CardTitle>
            <CardDescription>
              Information about {member.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {member.department && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Department</h3>
                <p>{member.department}</p>
              </div>
            )}
            {member.education && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Education</h3>
                <p>{member.education}</p>
              </div>
            )}
            {member.committee && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Committee</h3>
                <p>{member.committee}</p>
              </div>
            )}
            {member.society && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Society</h3>
                <p>{member.society}</p>
              </div>
            )}
            {member.corePosition && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Core Position</h3>
                <p>{member.corePosition}</p>
              </div>
            )}
            {member.executivePosition && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Executive Position</h3>
                <p>{member.executivePosition}</p>
              </div>
            )}
            {/* Admin Controls */}
            {window.location.pathname.includes("/ieee-admin-portal-sou-2025") && (
              <>
                <Separator className="my-4" />
                <div className="flex gap-2 justify-end">
                  <Button asChild variant="outline">
                    <Link to={`/ieee-admin-portal-sou-2025?edit=member&id=${member.id}`}>
                      Edit Member
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default MemberDetails;
