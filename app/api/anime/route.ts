import { NextRequest, NextResponse } from "next/server";

const ANILIST_URL = "https://graphql.anilist.co";
const PAGE_SIZE = 24;

const ANIME_QUERY = `
  query AnimeCatalog(
    $page: Int
    $perPage: Int
    $search: String
    $sort: [MediaSort]
    $genre: String
    $startDateGreater: FuzzyDateInt
    $startDateLesser: FuzzyDateInt
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        currentPage
        hasNextPage
        total
      }
      media(
        type: ANIME
        search: $search
        sort: $sort
        genre: $genre
        startDate_greater: $startDateGreater
        startDate_lesser: $startDateLesser
      ) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          extraLarge
          large
        }
        bannerImage
        description(asHtml: false)
        genres
        averageScore
        episodes
        duration
        format
        status
        season
        seasonYear
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        studios(isMain: true) {
          nodes {
            name
          }
        }
        siteUrl
        popularity
        nextAiringEpisode {
          episode
          airingAt
        }
      }
    }
  }
`;

const MOOD_GENRES: Record<string, string> = {
  Comfort: "Slice of Life",
  Hype: "Action",
  Emotional: "Drama",
  Romance: "Romance",
  Mystery: "Mystery",
  Adventure: "Adventure",
};

const ALLOWED_SORTS = new Set([
  "POPULARITY_DESC",
  "TRENDING_DESC",
  "SCORE_DESC",
  "START_DATE_DESC",
  "START_DATE",
]);

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const pageParam = Number(params.get("page") || 1);

  const page =
    Number.isFinite(pageParam)
      ? Math.max(1, Math.min(1000, Math.floor(pageParam)))
      : 1;

  const search = params.get("search")?.trim() || undefined;

  const requestedSort =
    params.get("sort") || "POPULARITY_DESC";

  const sort = ALLOWED_SORTS.has(requestedSort)
    ? requestedSort
    : "POPULARITY_DESC";

  const requestedGenre = params.get("genre") || "";
  const mood = params.get("mood") || "";

  const genre =
    requestedGenre || MOOD_GENRES[mood] || undefined;

  const yearText = params.get("year");

  const year =
    yearText && /^\d{4}$/.test(yearText)
      ? Number(yearText)
      : undefined;

  // AniList fuzzy dates use YYYYMMDD integer values.
  const startDateGreater = year
    ? year * 10000 - 1
    : undefined;

  const startDateLesser = year
    ? year * 10000 + 1232
    : undefined;

  const variables = {
    page,
    perPage: PAGE_SIZE,
    search,
    sort: [sort],
    genre,
    startDateGreater,
    startDateLesser,
  };

  try {
    const response = await fetch(ANILIST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: ANIME_QUERY,
        variables,
      }),
      next: {
        revalidate: 300,
      },
    });

    if (!response.ok) {
      console.error(
        "AniList request failed:",
        response.status,
      );

      return NextResponse.json(
        {
          message:
            response.status === 429
              ? "Too many requests. Please try again shortly."
              : "The anime provider is temporarily unavailable.",
        },
        {
          status:
            response.status === 429 ? 429 : 502,
        },
      );
    }

    const payload = await response.json();

    if (payload.errors?.length) {
      console.error(
        "AniList GraphQL errors:",
        payload.errors,
      );

      return NextResponse.json(
        {
          message: "Could not retrieve anime metadata.",
        },
        { status: 502 },
      );
    }

    const result = payload.data?.Page;

    return NextResponse.json(
      {
        results: result?.media ?? [],
        page:
          result?.pageInfo?.currentPage ?? page,
        hasNextPage: Boolean(
          result?.pageInfo?.hasNextPage,
        ),
        total: result?.pageInfo?.total ?? 0,
        source: "AniList",
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    console.error(
      "Anime catalogue request failed:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Anime catalogue is temporarily unavailable.",
      },
      { status: 500 },
    );
  }
}