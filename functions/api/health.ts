/**
 * Cloudflare Pages Function: /api/health
 */

export const onRequestGet: PagesFunction = async () => {
  return new Response(JSON.stringify({ ok: true, timestamp: new Date().toISOString() }), {
    headers: { "Content-Type": "application/json" },
  });
};
