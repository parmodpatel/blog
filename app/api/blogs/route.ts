import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { uploadBlogImage } from "@/lib/cloudinary";
import { connectMongoDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";

async function fileToDataUri(file: File) {
  const bytes = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${bytes.toString("base64")}`;
}

export async function GET() {
  try {
    await connectMongoDB();

    const blogs = await Blog.find()
      .populate("author", "name")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ blogs });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load blogs.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "You must be logged in to create a blog." },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const title = String(formData.get("title") || "").trim();
    const excerpt = String(formData.get("excerpt") || "").trim();
    const content = String(formData.get("content") || "").trim();
    const image = formData.get("image");

    if (!title || !excerpt || !content) {
      return NextResponse.json(
        { message: "Title, excerpt, and content are required." },
        { status: 400 },
      );
    }

    let imageUrl: string | undefined;
    let imagePublicId: string | undefined;

    if (image instanceof File && image.size > 0) {
      const upload = await uploadBlogImage(await fileToDataUri(image));
      imageUrl = upload.url;
      imagePublicId = upload.publicId;
    }

    await connectMongoDB();

    const blog = await Blog.create({
      title,
      excerpt,
      content,
      imageUrl,
      imagePublicId,
      author: user.id,
    });

    return NextResponse.json({ blog }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create blog.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
