import fs from "fs";
import csv from "csv-parser";
import { Role } from "@prisma/client";
import { getPrismaClient } from "../src/utils/prisma";

const prisma = getPrismaClient();

const normalizePhone = (phone: string) => {
  return phone?.replace(/\D/g, "").slice(-10);
};

const normalizeRoomType = (type: string) => {
  return type?.toUpperCase().replace(/\s+/g, "").replace("-", "");
};

const results: any[] = [];

async function runImport() {
  return new Promise<void>((resolve, reject) => {
    fs.createReadStream("cleaned_rental_listings.csv")
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("error", (err) => {
        console.error("❌ CSV read error:", err);
        reject(err);
      })
      .on("end", async () => {
        try {
          console.log(`📊 Total rows: ${results.length}`);

          for (const item of results) {
            try {
              const phone = normalizePhone(item.phone);

              if (!phone) {
                console.log("❌ Skipping row (no phone):", item.title);
                continue;
              }

              // 🔥 STEP 1: Find or Create Owner
              let user = await prisma.user.findUnique({
                where: { phone },
              });

              if (!user) {
                user = await prisma.user.create({
                  data: {
                    name: item.ownerName || "Owner",
                    phone,
                    email: item.ownerEmail || `${phone}@imported.com`,
                    password: "imported_user", // dummy
                    role: Role.OWNER,
                    phoneVerified: true,
                  },
                });

                console.log(`👤 Created user: ${phone}`);
              }

              // 🔥 STEP 2: Create Property
              await prisma.room.create({
                data: {
                  title: item.title,
                  description: item.description || "No description",
                  city: item.city?.toLowerCase(),
                  location: item.location || "",
                  landmark: item.location || "",

                  pricePerMonth: Number(item.price) || 0,
                  roomType: normalizeRoomType(item.roomType),

                  amenities: item.amenities
                    ? item.amenities.split(",").map((a: string) => a.trim())
                    : [],

                  images: item.imageUrl
                    ? item.imageUrl.split(",").map((url: string) => url.trim())
                    : [],

                  idealFor: ["ANY"],

                  ownerId: user.id,

                  reviewStatus: "PENDING",
                  isActive: true,
                },
              });

              console.log(`🏠 Added: ${item.title}`);
            } catch (err) {
              console.error("❌ Error processing row:", item.title, err);
            }
          }

          console.log("✅ Import completed");
          resolve();
        } catch (err) {
          console.error("❌ Import batch error:", err);
          reject(err);
        }
      });
  });
}

// ✅ Run import with proper lifecycle management
runImport()
  .catch((err) => {
    console.error("❌ Import failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
      console.log("✅ Database connection closed");
    } catch (err) {
      console.error("❌ Error closing database connection:", err);
    }
    process.exit(0);
  });