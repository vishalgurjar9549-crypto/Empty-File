import fs from "fs";
import csv from "csv-parser";
import { Role } from "@prisma/client";
import { getPrismaClient } from "../src/utils/prisma";

const prisma = getPrismaClient();

const FILE_NAME = "cleaned_rental_listings.csv";
const CHUNK_SIZE = 50;

let buffer: any[] = [];
let rowIndex = 0;

const normalizePhone = (phone: string) => {
  return phone?.replace(/\D/g, "").slice(-10);
};

const normalizeRoomType = (type: string) => {
  return type?.toUpperCase().replace(/\s+/g, "").replace("-", "") || "ROOM";
};

async function updateProgress(rowIndex: number) {
  await prisma.importProgress.update({
    where: { fileName: FILE_NAME },
    data: {
      lastProcessedRow: rowIndex,
    },
  });
}

async function processChunk(rows: any[]) {
  let inserted = 0;
  let skipped = 0;

  for (const item of rows) {
    try {
      const phone = normalizePhone(item.phone);

      if (!phone || !item.title || !item.city) {
        skipped++;
        continue;
      }

      // 🔹 Find or create user
      let user = await prisma.user.findUnique({
        where: { phone },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            name: item.ownerName || "Owner",
            phone,
            email: item.ownerEmail || `${phone}@imported.com`,
            password: "imported_user",
            role: Role.OWNER,
            phoneVerified: true,
          },
        });

        console.log(`👤 Created user: ${phone}`);
      }

      // 🔹 Duplicate check
      const exists = await prisma.room.findFirst({
        where: {
          title: item.title,
          city: item.city.toLowerCase(),
          ownerId: user.id,
        },
      });

      if (exists) {
        skipped++;
        continue;
      }

      // 🔹 Create property
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

          // ✅ FIX START
          reviewStatus: "NEEDS_CORRECTION",
          isActive: false, // match admin behavior

          adminFeedback: {
            reason: "other",
            reasonLabel: "Needs Correction",
            message: `This property was auto-imported. Please review and update details like location, amenities, images, and pricing.`,
            adminId: "system",
            adminName: "Admin",
            createdAt: new Date().toISOString(),
          },

        },
      });

      inserted++;
    } catch (err) {
      console.error("❌ Row failed:", item.title, err);
    }
  }

  console.log(
    `📦 Chunk done → ✅ ${inserted} inserted | ⚠️ ${skipped} skipped`,
  );
}

async function runImport() {
  // 🔹 Get progress
  const progress = await prisma.importProgress.upsert({
    where: { fileName: FILE_NAME },
    update: {},
    create: { fileName: FILE_NAME },
  });

  let lastProcessed = progress.lastProcessedRow;

  console.log(`🔁 Resuming from row: ${lastProcessed}`);

  return new Promise<void>((resolve, reject) => {
    const stream = fs.createReadStream(FILE_NAME).pipe(csv());

    stream
      .on("data", async function (data) {
        rowIndex++;

        if (rowIndex <= lastProcessed) return;

        buffer.push(data);

        if (buffer.length >= CHUNK_SIZE) {
          stream.pause();

          await processChunk(buffer);

          buffer = [];

          await updateProgress(rowIndex);

          stream.resume();
        }
      })
      .on("error", (err) => {
        console.error("❌ CSV read error:", err);
        reject(err);
      })
      .on("end", async () => {
        try {
          if (buffer.length > 0) {
            await processChunk(buffer);
            await updateProgress(rowIndex);
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

// ✅ Run
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
      console.error("❌ Error closing DB:", err);
    }
    process.exit(0);
  });
