"use client";

import { useMemo, useState } from "react";

export type BlogCard = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl?: string;
  authorName: string;
  createdAt: string;
};

type BlogFeedProps = {
  blogs: BlogCard[];
  error: string | null;
};

export default function BlogFeed({ blogs, error }: BlogFeedProps) {
  const [query, setQuery] = useState("");
  const [selectedBlog, setSelectedBlog] = useState<BlogCard | null>(null);

  const filteredBlogs = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) {
      return blogs;
    }

    return blogs.filter((blog) =>
      [blog.title, blog.excerpt, blog.content, blog.authorName]
        .join(" ")
        .toLowerCase()
        .includes(search),
    );
  }, [blogs, query]);

  const featuredBlog = filteredBlogs[0];
  const remainingBlogs = filteredBlogs.slice(1);

  return (
    <section className="grid gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Latest blogs</h2>
          <p className="mt-1 text-sm text-[#9aa4b2]">
            {filteredBlogs.length} of {blogs.length} posts
          </p>
        </div>

        <label className="grid gap-2 text-sm font-medium text-[#dbe3ee] md:w-80">
          Search posts
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-11 rounded-md border border-[#3b4250] bg-[#171a21] px-3 text-white outline-none transition placeholder:text-[#7c8594] focus:border-[#8ab4f8]"
            placeholder="Title, author, or content"
          />
        </label>
      </div>

      {error ? (
        <div className="rounded-lg border border-[#5f3838] bg-[#251719] px-5 py-6">
          <h3 className="text-xl font-semibold text-[#f6b9b9]">Please wait</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#f0c6c6]">
            {error}
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#d5a3a3]">
            Server might be starting up. Please wait a few seconds and refresh
            the page.
          </p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#3b4250] bg-[#171a21] px-5 py-10 text-center">
          <h3 className="text-xl font-semibold text-white">No blogs yet</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#b8c0cc]">
            Signup, publish your first post, and add a cover image to see it in
            the feed.
          </p>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="rounded-lg border border-[#2d313a] bg-[#171a21] px-5 py-10 text-center">
          <h3 className="text-xl font-semibold text-white">No matching posts</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#b8c0cc]">
            Try another title, author, or phrase from the post.
          </p>
        </div>
      ) : (
        <>
          {featuredBlog ? (
            <article className="grid overflow-hidden rounded-lg border border-[#2d313a] bg-[#171a21] shadow-sm lg:grid-cols-[1.08fr_0.92fr]">
              <PostImage blog={featuredBlog} featured />
              <div className="flex flex-col justify-between gap-8 p-6">
                <PostMeta blog={featuredBlog} />
                <div>
                  <h3 className="text-3xl font-semibold leading-tight text-white">
                    {featuredBlog.title}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-[#b8c0cc]">
                    {featuredBlog.excerpt}
                  </p>
                  <p className="mt-5 line-clamp-5 whitespace-pre-wrap text-sm leading-6 text-[#d2d8e2]">
                    {featuredBlog.content}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBlog(featuredBlog)}
                  className="h-11 w-fit rounded-md bg-[#8ab4f8] px-5 text-sm font-semibold text-[#07111f] transition hover:bg-[#a8c7fa]"
                >
                  View post
                </button>
              </div>
            </article>
          ) : null}

          {remainingBlogs.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2">
              {remainingBlogs.map((blog) => (
                <article
                  key={blog.id}
                  className="group flex min-h-full flex-col overflow-hidden rounded-lg border border-[#2d313a] bg-[#171a21] transition hover:-translate-y-0.5 hover:border-[#4d5666] hover:bg-[#1c2029] hover:shadow-md"
                >
                  <PostImage blog={blog} />
                  <div className="flex flex-1 flex-col gap-4 p-5">
                    <PostMeta blog={blog} />
                    <div>
                      <h3 className="text-2xl font-semibold leading-tight text-white">
                        {blog.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[#b8c0cc]">
                        {blog.excerpt}
                      </p>
                    </div>
                    <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-[#d2d8e2]">
                      {blog.content}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedBlog(blog)}
                      className="mt-auto h-10 w-fit rounded-md border border-[#3b4250] px-4 text-sm font-semibold text-[#dbe3ee] transition hover:border-[#8ab4f8] hover:bg-[#202637] hover:text-white"
                    >
                      View post
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </>
      )}

      {selectedBlog ? (
        <PostModal blog={selectedBlog} onClose={() => setSelectedBlog(null)} />
      ) : null}
    </section>
  );
}

function PostImage({
  blog,
  featured = false,
}: {
  blog: BlogCard;
  featured?: boolean;
}) {
  if (!blog.imageUrl) {
    return (
      <div
        className={`grid place-items-center bg-[#0b0d12] ${
          featured ? "aspect-[16/9] lg:h-full lg:min-h-[390px]" : "aspect-[16/9]"
        }`}
      >
        <span className="text-sm font-medium text-[#7c8594]">No cover image</span>
      </div>
    );
  }

  return (
    <div
      className={`grid place-items-center overflow-hidden bg-[#0b0d12] ${
        featured ? "aspect-[16/9] lg:h-full lg:min-h-[390px]" : "aspect-[16/9]"
      }`}
    >
      <img
        src={blog.imageUrl}
        alt={blog.title}
        className="h-full w-full object-contain"
      />
    </div>
  );
}

function PostMeta({ blog }: { blog: BlogCard }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium uppercase tracking-[0.14em] text-[#9aa4b2]">
      <span>{blog.authorName}</span>
      <span>{blog.createdAt}</span>
    </div>
  );
}

function PostModal({
  blog,
  onClose,
}: {
  blog: BlogCard;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 px-4 py-6 backdrop-blur-sm">
      <div className="mx-auto min-h-full w-full max-w-4xl">
        <article className="overflow-hidden rounded-lg border border-[#2d313a] bg-[#171a21] shadow-2xl">
          <div className="flex items-center justify-between gap-4 border-b border-[#2d313a] px-5 py-4">
            <PostMeta blog={blog} />
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-md border border-[#3b4250] text-xl leading-none text-[#dbe3ee] transition hover:border-[#8ab4f8] hover:text-white"
              aria-label="Close post"
            >
              x
            </button>
          </div>

          {blog.imageUrl ? (
            <div className="grid aspect-[16/9] max-h-[70vh] place-items-center bg-[#0b0d12]">
              <img
                src={blog.imageUrl}
                alt={blog.title}
                className="h-full w-full object-contain"
              />
            </div>
          ) : null}

          <div className="grid gap-5 px-5 py-6 sm:px-8 sm:py-8">
            <div>
              <h2 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
                {blog.title}
              </h2>
              <p className="mt-3 text-base leading-7 text-[#b8c0cc]">
                {blog.excerpt}
              </p>
            </div>
            <div className="whitespace-pre-wrap text-base leading-8 text-[#e7ebf1]">
              {blog.content}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
