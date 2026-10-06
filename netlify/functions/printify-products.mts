import type { Config, Context } from "@netlify/functions";

export default async (_req: Request, _context: Context) => {
  const token = Netlify.env.get("PRINTIFY_API_TOKEN");
  const shopId = Netlify.env.get("PRINTIFY_SHOP_ID");

  if (!token || !shopId) {
    return Response.json(
      { configured: false, message: "Printify API sync is not configured." },
      { status: 503 },
    );
  }

  const response = await fetch(`https://api.printify.com/v1/shops/${shopId}/products.json`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    return Response.json(
      { configured: true, message: "Printify catalog request failed." },
      { status: 502 },
    );
  }

  const payload = await response.json();
  return Response.json(payload, {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=900" },
  });
};

export const config: Config = {
  path: "/api/printify-products",
};
