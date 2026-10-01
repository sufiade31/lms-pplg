// ============================================
//  seed.js — bikin user admin pertama (FIXED)
//  Jalankan: node seed.js
// ============================================
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "./models/User.js";

function loadEnv() {
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    const content = fs.readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (match) process.env[match[1]] = match[2];
    }
  } catch {
    console.error("❌ File .env.local tidak ditemukan!");
    process.exit(1);
  }
}

loadEnv();

// Field disesuaikan dengan schema User (pakai "nama", bukan "username")
const ADMIN_DATA = {
  nama: "admin",
  email: "admin@smkcitranegara.sch.id",
  password: "123",
  role: "admin",
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Terkoneksi ke MongoDB");

    const exists = await User.findOne({
      $or: [{ email: ADMIN_DATA.email }, { nama: ADMIN_DATA.nama }],
    });

    if (exists) {
      console.log("⚠️  Admin sudah ada, skip.");
      await mongoose.disconnect();
      return;
    }

    const hashedPassword = await bcrypt.hash(ADMIN_DATA.password, 10);

    await User.create({ ...ADMIN_DATA, password: hashedPassword });

    console.log("🎉 Admin berhasil dibuat:");
    console.log("   Nama  :", ADMIN_DATA.nama);
    console.log("   Email :", ADMIN_DATA.email);
    console.log("   Role  :", ADMIN_DATA.role);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Gagal seed:", err.message);
    process.exit(1);
  }
}

seed();