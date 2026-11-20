
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request) {
  try {
    await connectDB();

    const { nama, email, password, role } = await request.json();

    if (!nama || !email || !password || !role) {
      return Response.json(
        { error: "Semua field wajib diisi." },
        { status: 400 }
      );
    }

    if (!["guru", "kepsek", "kurikulum", "siswa"].includes(role)) {
      return Response.json(
        { error: "Role tidak valid." },
        { status: 400 }
      );
    }

    const emailNormal = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: emailNormal });

    if (existingUser) {
      return Response.json(
        { error: "Email sudah terdaftar." },
        { status: 409 }
      );
    }

    const user = await User.create({
      nama: nama.trim(),
      email: emailNormal,
      password,
      role,
    });

    return Response.json(
      {
        message: "Pengguna berhasil ditambahkan.",
        user: {
          _id: user._id,
          nama: user.nama,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Gagal membuat pengguna:", error);

    return Response.json(
      { error: "Terjadi kesalahan saat menyimpan pengguna." },
      { status: 500 }
    );
  }
}
