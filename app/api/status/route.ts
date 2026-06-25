import { NextResponse } from "next/server";
import { hasCloudinaryConfig, pingCloudinary } from "@/lib/cloudinary";
import { connectMongoDB } from "@/lib/mongodb";

export async function GET() {
  const checks = {
    mongodb: {
      ok: false,
      message: "Not checked",
    },
    cloudinary: {
      ok: false,
      message: "Not checked",
    },
    auth: {
      ok: Boolean(process.env.JWT_SECRET),
      message: process.env.JWT_SECRET ? "JWT secret is configured" : "JWT secret is missing",
    },
  };

  try {
    const connection = await connectMongoDB();
    await connection.connection.db?.admin().ping();
    checks.mongodb = {
      ok: true,
      message: "MongoDB connected",
    };
  } catch (error) {
    checks.mongodb = {
      ok: false,
      message:
        error instanceof Error ? error.message : "Unable to connect to MongoDB",
    };
  }

  if (!hasCloudinaryConfig()) {
    checks.cloudinary = {
      ok: false,
      message: "Cloudinary env is missing",
    };
  } else {
    try {
      await pingCloudinary();
      checks.cloudinary = {
        ok: true,
        message: "Cloudinary connected",
      };
    } catch (error) {
      checks.cloudinary = {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to connect to Cloudinary",
      };
    }
  }

  const ok = checks.mongodb.ok && checks.cloudinary.ok && checks.auth.ok;

  return NextResponse.json({ ok, checks }, { status: ok ? 200 : 503 });
}
