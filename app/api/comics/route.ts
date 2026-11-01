
import { NextRequest, NextResponse } from "next/server";

const OPEN_LIBRARY_API = "https://openlibrary.org/search.json";

type OpenLibraryBook = {
  key?: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  subject?: string[];
};

type OpenLibraryResponse = {
  numFound?: number;
  docs?: OpenLibraryBook[];
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("q")?.trim() || "graphic novels";
    const page = Math.max(
      1,
      Math.floor(Number(searchParams.get("page")) || 1)
    );

    if (search.length > 100) {
      return NextResponse.json(
        { error: "Search query must be 100 characters or fewer." },
        { status: 400 }
      );
    }

    const url = new URL(OPEN_LIBRARY_API);

    url.searchParams.set("q", search);
    url.searchParams.set(
      "fields",
      "key,title,author_name,first_publish_year,cover_i,subject"
    );
    url.searchParams.set("limit", "20");
    url.searchParams.set("page", String(page));

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "REELORA/1.0 (comic discovery website)",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error(
        "Open Library response:",
        response.status,
        response.statusText
      );

      return NextResponse.json(
        { error: "Open Library could not fulfil the request." },
        { status: 502 }
      );
    }

    const data: OpenLibraryResponse = await response.json();

    const comics = (data.docs ?? [])
      .filter((item) => {
        const subjects = (item.subject ?? []).join(" ").toLowerCase();

        return (
          Boolean(item.key) &&
          Boolean(item.title) &&
          Boolean(item.cover_i) &&
          /comic|graphic novel|manga|superhero|cartoon|bandes dessinées/i.test(
            subjects
          )
        );
      })
      .map((item) => ({
        id: item.key!,
        title: item.title!,
        authors: item.author_name ?? [],
        year: item.first_publish_year ?? null,
        coverUrl: `https://covers.openlibrary.org/b/id/${item.cover_i}-L.jpg`,
        subjects: item.subject ?? [],
        sourceUrl: `https://openlibrary.org${item.key}`,
      }));

    return NextResponse.json({
      comics,
      totalResults: data.numFound ?? 0,
      page,
    });
  } catch (error) {
    console.error("Comics API error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while searching comics.",
        details:
          error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}