import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

console.log("PAKAI URI:", MONGODB_URI); // sementara, hapus nanti

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI belum di-set di .env.local");
}

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).catch((err) => {
      cached.promise = null; // biar bisa retry kalo gagal
      throw err;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;