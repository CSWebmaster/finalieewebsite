/**
 * Cloudflare Pages Function: /api/media
 * 
 * Proxies external image requests to prevent insecure domain 
 * warnings and mask asset sources.
 */

export const onRequestGet: PagesFunction = async (context) => {
  const { request } = context;
  const url = new URL(request.url);
  const imageUrl = url.searchParams.get("url");

  if (!imageUrl) {
    return new Response("URL is required", { status: 400 });
  }

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error("Fetch failed");

    const contentType = response.headers.get("content-type");
    const headers = new Headers();
    if (contentType) headers.set("Content-Type", contentType);
    headers.set("Cache-Control", "public, max-age=86400");

    return new Response(response.body, {
      status: response.status,
      headers,
    });
  } catch (error) {
    return new Response("Not found", { status: 404 });
  }
};
