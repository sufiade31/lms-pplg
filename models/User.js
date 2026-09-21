import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    nama: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "guru", "siswa", "kepsek_kurikulum"],
      required: true,
    },
    kelas: { type: mongoose.Schema.Types.ObjectId, ref: "Kelas" },
    nis: { type: String },
    mapelDiajar: [{ type: mongoose.Schema.Types.ObjectId, ref: "MataPelajaran" }],
    nip: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema, "user");