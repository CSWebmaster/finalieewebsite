/**
 * Central API Client for IEEE SOU SB Website
 * This file handles all network requests to the backend for Auth and DB.
 * It's proxied via Vite (/api) to the local server or Firebase Functions.
 */

// --- AUTHENTICATION ---

/**
 * Fetches the currently authenticated user session.
 */
export async function getMe() {
  const response = await fetch("/api/me");
  if (!response.ok) return { user: null };
  return response.json();
}

/**
 * Logs in a user with email and password.
 */
export async function login(credentials: Record<string, any>) {
  const response = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Login failed");
  }
  return response.json();
}

/**
 * Logs out the current user session.
 */
export async function logout() {
  const response = await fetch("/api/logout", {
    method: "POST",
  });
  if (!response.ok) throw new Error("Logout failed");
  return response.json();
}

// --- DATABASE OPERATIONS (MOCKED AS API) ---

/**
 * Fetches all documents in a collection.
 */
export async function getCollection(collectionName: string) {
  const response = await fetch(`/api/db/${collectionName}`);
  if (!response.ok) {
    console.error(`Failed to fetch collection: ${collectionName}`);
    return [];
  }
  return response.json();
}

/**
 * Fetches a single document by ID from a collection.
 */
export async function getDocument(collectionName: string, id: string) {
  const response = await fetch(`/api/db/${collectionName}/${id}`);
  if (!response.ok) {
    throw new Error(`Document ${id} not found in ${collectionName}`);
  }
  return response.json();
}

/**
 * Creates a new document in a collection.
 */
export async function createDoc(collectionName: string, data: any) {
  const response = await fetch(`/api/db/${collectionName}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Failed to create document in ${collectionName}`);
  return response.json();
}

/**
 * Updates an existing document in a collection.
 */
export async function updateDoc(collectionName: string, id: string, data: any) {
  const response = await fetch(`/api/db/${collectionName}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Failed to update document: ${id}`);
  return response.json();
}

/**
 * Deletes a document by ID.
 */
export async function deleteDoc(collectionName: string, id: string) {
  const response = await fetch(`/api/db/${collectionName}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error(`Failed to delete document: ${id}`);
  return response.json();
}

/**
 * Submits a new blog post for admin review.
 */
export async function submitBlog(blogData: any) {
  return createDoc("blogs", blogData);
}
