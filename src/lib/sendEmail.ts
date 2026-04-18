export interface EmailPayload {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  page: "Contact" | "Join";
  fields?: Record<string, string>;
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const res = await fetch("/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to send email.");
  }
}
