import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request) {
  try {
    await connectDB();

    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user || !(await user.matchPassword(password))) {
      return Response.json(
        { error: "Email atau password salah." },
        { status: 401 }
      );
    }

    return Response.json({
      _id: user._id,
      nama: user.nama,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Login error:", error);

    return Response.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
