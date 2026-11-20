import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    nama: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "guru", "kepsek", "kurikulum", "siswa"],
      default: "siswa",
    },
  },
  { timestamps: true }
);

// Auto-hash password sebelum save
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Method buat ngecek password pas login
UserSchema.methods.matchPassword = function (passwordInput) {
  return bcrypt.compare(passwordInput, this.password);
};

export default mongoose.models.User || mongoose.model("User", UserSchema);