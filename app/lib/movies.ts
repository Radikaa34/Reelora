
export type Movie = {
  id: number;
  title: string;
  year: number;
  rating: number;
  poster: string;
};

export const trendingMovies: Movie[] = [
  {
    id: 1,
    title: "Inception",
    year: 2010,
    rating: 8.8,
    poster:
      "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
  },
  {
    id: 2,
    title: "Interstellar",
    year: 2014,
    rating: 8.7,
    poster:
      "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
  },
  {
    id: 3,
    title: "The Batman",
    year: 2022,
    rating: 7.8,
    poster:
      "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
  },
  {
    id: 4,
    title: "Dune: Part Two",
    year: 2024,
    rating: 8.5,
    poster:
      "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
  },
  {
    id: 5,
    title: "Spider-Man: Across the Spider-Verse",
    year: 2023,
    rating: 8.6,
    poster:
      "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
  },
  {
    id: 6,
    title: "Everything Everywhere All at Once",
    year: 2022,
    rating: 7.8,
    poster:
      "https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg",
  },
];
