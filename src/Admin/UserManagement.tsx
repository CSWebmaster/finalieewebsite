import React, { useState, useEffect } from "react";
import {
  collection,
  doc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore";
import { db } from "../firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, UserPlus, Shield, User } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface UserManagementProps {
  onEdit: (user: any) => void;
  setSuccess: (message: string) => void;
  setError: (message: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({
  onEdit,
  setSuccess,
  setError,
}) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    const usersQuery = query(collection(db, "users"), orderBy("name", "asc"));

    const unsubscribe = onSnapshot(
      usersQuery,
      (querySnapshot) => {
        const usersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as any[];
        setUsers(usersList);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching users:", err);
        setError(`Error fetching users: ${err.message}`);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [setError]);

  const handleDelete = async (userId: string) => {
    try {
      await deleteDoc(doc(db, "users", userId));
      setSuccess("User removed successfully!");
      setConfirmDelete(null);
    } catch (err: any) {
      setError(`Error removing user: ${err.message}`);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.enrollment_number?.toString().includes(searchQuery)
  );

  return (
    <div className="space-y-4">
      <div className="relative w-full md:w-96">
        <Input
          placeholder="Search users by name, email or enrollment..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse h-32 bg-slate-100 dark:bg-slate-800" />
          ))
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((u) => (
            <Card key={u.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                      {u.role === 'admin' ? <Shield size={20} /> : <User size={20} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{u.name}</h3>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                    {u.role}
                  </Badge>
                </div>
                
                <div className="mt-3 py-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-muted-foreground italic">
                    Enrollment: <span className="font-medium text-foreground">{u.enrollment_number}</span>
                  </p>
                </div>

                <div className="flex justify-end gap-2 mt-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(u)}>
                    <Pencil className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => setConfirmDelete(u.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-10 text-center text-muted-foreground border-2 border-dashed rounded-xl">
            No users found match your search.
          </div>
        )}
      </div>

      {confirmDelete && (
        <AlertDialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the user's access to protected parts of the site.
                You can always add them back later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => handleDelete(confirmDelete)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default UserManagement;
