// ============================================
//  seed-murid.js — bikin akun murid/siswa
//  Jalankan: node seed-murid.js
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

// ============================================
//  ✏️ EDIT DAFTAR MURID DI SINI
//  Tinggal tambah/kurangi/hapus baris.
//  Email dibuat otomatis kalau dikosongkan.
// ============================================
const DEFAULT_PASSWORD = "123"; // ← password default semua murid

const DAFTAR_MURID = [
  { nama: "upil",         email: "upilya@smkcitranegara.sch.id" },
  { nama: "arya",    email: "arya syahgifari@smkcitranegara.sch.id" },
  { nama: "Siti Rahma",     email: "" },   // email dikosongin = dibikin otomatis
  { nama: "Budi Santoso",   email: "" },
  { nama: "Dewi Anggraini", email: "" },
  { nama: "Rizky Pratama",  email: "" },
  // tambahin murid lain di sini...
];

// Bikin email otomatis dari nama: "Ahmad Fauzi" -> "ahmad.fauzi@smkcitranegara.sch.id"
function emailDariNama(nama) {
  return nama.toLowerCase().trim().replace(/\s+/g, ".") + "@smkcitranegara.sch.id";
}

async function seedMurid() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Terkoneksi ke MongoDB\n");

    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    let dibuat = 0, dilewati = 0;

    for (const murid of DAFTAR_MURID) {
      const email = murid.email || emailDariNama(murid.nama);

      // Lewati kalau email sudah ada
      const exists = await User.findOne({ email });
      if (exists) {
        console.log("⏭️  Skip (udah ada) :", murid.nama);
        dilewati++;
        continue;
      }

      await User.create({
        nama: murid.nama,
        email: email,
        password: hashedPassword,
        role: "siswa",
      });

      console.log("🎉 Dibuat           :", murid.nama, "→", email);
      dibuat++;
    }

    console.log("\n========================================");
    console.log("✅ Selesai!");
    console.log("   Murid baru :", dibuat);
    console.log("   Dilewati   :", dilewati);
    console.log("   Password default semua:", DEFAULT_PASSWORD);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Gagal:", err.message);
    process.exit(1);
  }
}

seedMurid();