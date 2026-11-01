const TRENDING_ANIME_QUERY = `
  query {
    Page(page: 1, perPage: 10) {
      media(type: ANIME, sort: TRENDING_DESC) {
        id
        title {
          english
          romaji
        }
        coverImage {
          large
        }
        averageScore
        popularity
      }
    }
  }
`;


export type Anime = {
    id: number;
    title: {
        english: string | null;
        romaji: string;
    };
    coverImage: {
        large: string;
    };
    averageScore: number | null;
    popularity: number;
};


type AniListResponse = {
    data: {
        Page: {
            media: Anime[];
        };
    };
    errors?: {
        message: string;
    }[];
};


export async function getTrendingAnime(): Promise<Anime[]>{
    const response=await fetch("https://graphql.anilist.co",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            Accept:"application/json",
        },
        body:JSON.stringify({
            query:TRENDING_ANIME_QUERY,
        }),
        next: {revalidate:3600},
    });
    if(!response.ok){
        throw new Error("Failed to fetch trending anime");
    }
    const result: AniListResponse = await response.json();
    if(result.errors){
        throw new Error("AniList returned a query error");
    }
    return result.data.Page.media;
}