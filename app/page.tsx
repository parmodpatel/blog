import Link from "next/link";
import BlogComposer from "@/app/components/BlogComposer";
import BlogFeed, { type BlogCard } from "@/app/components/BlogFeed";
import LogoutButton from "@/app/components/LogoutButton";
import { getCurrentUser } from "@/lib/auth";
import { connectMongoDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";

export const dynamic = "force-dynamic";

type BlogState = {
  blogs: BlogCard[];
  error: string | null;
};

async function getBlogs(): Promise<BlogState> {
  try {
    await connectMongoDB();

    const blogs = await Blog.find()
      .populate("author", "name")
      .sort({ createdAt: -1 })
      .lean();

    return {
      error: null,
      blogs: blogs.map((blog) => {
        const author = blog.author as unknown as { name?: string };

        return {
          id: blog._id.toString(),
          title: blog.title,
          excerpt: blog.excerpt,
          content: blog.content,
          imageUrl: blog.imageUrl,
          authorName: author?.name || "Unknown author",
          createdAt: new Date(blog.createdAt).toLocaleDateString("en", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        };
      }) satisfies BlogCard[],
    };
  } catch (error) {
    return {
      blogs: [],
      error: error instanceof Error ? error.message : "Unable to load blogs.",
    };
  }
}

export default async function Home() {
  const [user, blogState] = await Promise.all([getCurrentUser(), getBlogs()]);
  const { blogs, error: blogsError } = blogState;

  return (
    <main className="min-h-screen bg-[#0f1115] text-neutral-100">
      <header className="sticky top-0 z-40 border-b border-[#2d313a] bg-[#151820]/95 backdrop-blur">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight text-white">
            Blogroom
          </Link>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden text-sm text-[#b8c0cc] sm:inline">
                  {user.name}
                </span>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="h-10 rounded-md border border-[#3b4250] px-4 py-2 text-sm font-semibold text-[#dbe3ee] transition hover:border-[#8ab4f8] hover:text-white"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="h-10 rounded-md bg-[#8ab4f8] px-4 py-2 text-sm font-semibold text-[#07111f] transition hover:bg-[#a8c7fa]"
                >
                  Signup
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-10">
        <div className="grid gap-5 border-b border-[#2d313a] pb-8 md:grid-cols-[1fr_340px] md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8ab4f8]">
              Blogs home
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
              Read, publish, and keep your stories in one place.
            </h1>
          </div>
          <p className="text-sm leading-6 text-[#b8c0cc]">
            Accounts and posts are saved in MongoDB. Uploaded cover images are
            framed consistently, keep their original proportions, and open into
            a complete reading view.
          </p>
        </div>

        {user ? <BlogComposer /> : null}

        <BlogFeed blogs={blogs} error={blogsError} />
      </section>
    </main>
  );
}
