import { Router } from "express";
import { getPrismaClient } from "../utils/prisma";
import { logger } from "../utils/logger";

const router = Router();
const prisma = getPrismaClient();

const PUBLIC_SITE_URL = "https://homilivo.com";
const DEFAULT_OG_IMAGE = `${PUBLIC_SITE_URL}/og-image.png`;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const isLocalUrl = (url: string) =>
  /^(https?:)?\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?/i.test(url);

const getPublicUrl = (path: string) => `${PUBLIC_SITE_URL}${path}`;

const getPublicImageUrl = (imageUrl?: string | null) => {
  if (!imageUrl) return DEFAULT_OG_IMAGE;

  if (/^https?:\/\//i.test(imageUrl)) {
    return isLocalUrl(imageUrl) ? DEFAULT_OG_IMAGE : imageUrl;
  }

  if (imageUrl.startsWith("//")) {
    const absoluteUrl = `https:${imageUrl}`;
    return isLocalUrl(absoluteUrl) ? DEFAULT_OG_IMAGE : absoluteUrl;
  }

  if (imageUrl.startsWith("/")) {
    return getPublicUrl(imageUrl);
  }

  return DEFAULT_OG_IMAGE;
};

const renderPropertyOgHtml = ({
  title,
  description,
  imageUrl,
  canonicalUrl,
  redirectPath,
  propertyPrice,
  propertyLocation,
}: {
  title: string;
  description: string;
  imageUrl: string;
  canonicalUrl: string;
  redirectPath: string;
  propertyPrice?: string;
  propertyLocation?: string;
}) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>Redirecting to property...</title>
    <meta name="description" content="${escapeHtml(description)}" />
    
    <!-- Primary Redirect Method: Meta Refresh (works when JS disabled) -->
    <meta http-equiv="refresh" content="0;url=${escapeHtml(redirectPath)}" />
    
    <!-- OG Tags for Social Media Preview -->
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:type" content="website" />
    
    <!-- Twitter Card Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
    
    <!-- SEO -->
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
    
    <!-- Secondary Redirect Method: JavaScript (faster) -->
    <script>
      window.addEventListener('load', function() {
        window.location.replace(${JSON.stringify(redirectPath)});
      });
      window.setTimeout(function() {
        window.location.replace(${JSON.stringify(redirectPath)});
      }, 50);
    </script>
    
    <!-- Inline Styles for Fallback UI -->
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
        background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
      }
      .container {
        max-width: 600px;
        width: 100%;
        background: white;
        border-radius: 16px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        overflow: hidden;
        animation: fadeIn 0.3s ease-in-out;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .image-wrapper {
        width: 100%;
        height: 300px;
        overflow: hidden;
        background: #f0f0f0;
      }
      .image-wrapper img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .content {
        padding: 24px;
      }
      .title {
        font-size: 24px;
        font-weight: 700;
        color: #1a1a1a;
        margin-bottom: 8px;
        line-height: 1.3;
      }
      .location {
        font-size: 14px;
        color: #666;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .description {
        font-size: 15px;
        color: #555;
        line-height: 1.6;
        margin-bottom: 24px;
      }
      .cta-button {
        display: inline-block;
        width: 100%;
        padding: 16px 20px;
        background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
        color: white;
        text-align: center;
        text-decoration: none;
        border-radius: 10px;
        font-size: 16px;
        font-weight: 600;
        border: none;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .cta-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
      }
      .loading {
        font-size: 14px;
        color: #999;
        margin-top: 16px;
        text-align: center;
      }
      .error {
        padding: 24px;
      }
      .error-title {
        font-size: 20px;
        font-weight: 700;
        color: #d32f2f;
        margin-bottom: 8px;
      }
      .error-text {
        font-size: 15px;
        color: #555;
        line-height: 1.6;
        margin-bottom: 24px;
      }
    </style>
  </head>
  <body>
    ${propertyPrice ? `
    <div class="container">
      <div class="image-wrapper">
        <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}" loading="lazy" />
      </div>
      <div class="content">
        <h1 class="title">${escapeHtml(title)}</h1>
        ${propertyLocation ? `<div class="location">📍 ${escapeHtml(propertyLocation)}</div>` : ''}
        <p class="description">${escapeHtml(description)}</p>
        <a href="${escapeHtml(redirectPath)}" class="cta-button">View Property</a>
        <p class="loading">Redirecting...</p>
      </div>
    </div>
    ` : `
    <div class="container error">
      <h1 class="error-title">Property Not Found</h1>
      <p class="error-text">${escapeHtml(description)}</p>
      <a href="${escapeHtml(redirectPath)}" class="cta-button">Back to Listings</a>
      <p class="loading">Redirecting to listings...</p>
    </div>
    `}
  </body>
</html>`;

router.get("/property/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const property = await prisma.room.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        location: true,
        city: true,
        pricePerMonth: true,
        images: true,
      },
    });

    if (!property) {
      return res.status(404).type("html").send(
        renderPropertyOgHtml({
          title: "Property not found | Homilivo",
          description: "This property may no longer be available on Homilivo.",
          imageUrl: DEFAULT_OG_IMAGE,
          canonicalUrl: getPublicUrl("/rooms"),
          redirectPath: getPublicUrl("/rooms"),
        })
      );
    }

    const price = `₹${property.pricePerMonth.toLocaleString("en-IN")}`;
    const location = [property.location, property.city].filter(Boolean).join(", ");
    const title = `${property.title} - ${price}`;
    const description = `${property.title} in ${location} for ${price}/month`;
    const imageUrl = getPublicImageUrl(property.images?.[0]);
    const canonicalUrl = getPublicUrl(`/rooms/${property.id}`);
    const redirectPath = getPublicUrl(`/rooms/${property.id}`);

    res
      .status(200)
      .setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=3600")
      .type("html")
      .send(
        renderPropertyOgHtml({
          title,
          description,
          imageUrl,
          canonicalUrl,
          redirectPath,
          propertyPrice: price,
          propertyLocation: location,
        })
      );
  } catch (error: any) {
    logger.error("Failed to render property OG preview", {
      propertyId: id,
      error: error?.message,
    });

    res.status(500).type("html").send(
      renderPropertyOgHtml({
        title: "Homilivo | Property Preview",
        description: "View this property on Homilivo.",
        imageUrl: DEFAULT_OG_IMAGE,
        canonicalUrl: getPublicUrl(`/rooms/${id}`),
        redirectPath: getPublicUrl(`/rooms/${id}`),
      })
    );
  }
});

export default router;
