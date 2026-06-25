"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";

export default function BlogComposer() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setPreviewUrl("");
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const response = await fetch("/api/blogs", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(data.message || "Unable to publish blog.");
      return;
    }

    form.reset();
    setPreviewUrl("");
    setMessage("Published.");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-lg border border-[#2d313a] bg-[#171a21] p-5 shadow-sm"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-[#dbe3ee]">
          Title
          <input
            name="title"
            required
            maxLength={140}
            className="h-11 rounded-md border border-[#3b4250] bg-[#0f1115] px-3 text-white outline-none transition placeholder:text-[#7c8594] focus:border-[#8ab4f8]"
            placeholder="What are you writing about?"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-[#dbe3ee]">
          Cover image
          <input
            name="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="h-11 rounded-md border border-[#3b4250] bg-[#0f1115] px-3 py-2 text-sm text-[#dbe3ee] file:mr-3 file:rounded-md file:border-0 file:bg-[#8ab4f8] file:px-3 file:py-1 file:text-[#07111f]"
          />
        </label>
      </div>

      {previewUrl ? (
        <div className="grid gap-2">
          <p className="text-sm font-medium text-[#dbe3ee]">Cover preview</p>
          <div className="grid aspect-[16/9] place-items-center overflow-hidden rounded-lg border border-[#2d313a] bg-[#0b0d12]">
            <img
              src={previewUrl}
              alt=""
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      ) : null}

      <label className="grid gap-2 text-sm font-medium text-[#dbe3ee]">
        Excerpt
        <input
          name="excerpt"
          required
          maxLength={220}
          className="h-11 rounded-md border border-[#3b4250] bg-[#0f1115] px-3 text-white outline-none transition placeholder:text-[#7c8594] focus:border-[#8ab4f8]"
          placeholder="A short summary for the feed"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-[#dbe3ee]">
        Content
        <textarea
          name="content"
          required
          rows={5}
          className="resize-y rounded-md border border-[#3b4250] bg-[#0f1115] px-3 py-3 text-white outline-none transition placeholder:text-[#7c8594] focus:border-[#8ab4f8]"
          placeholder="Write the post..."
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="h-11 rounded-md bg-[#8ab4f8] px-5 text-sm font-semibold text-[#07111f] transition hover:bg-[#a8c7fa] disabled:cursor-not-allowed disabled:bg-[#3b4250] disabled:text-[#8d96a6]"
        >
          {loading ? "Publishing..." : "Publish blog"}
        </button>
        {message ? <p className="text-sm text-[#b8c0cc]">{message}</p> : null}
      </div>
    </form>
  );
}
