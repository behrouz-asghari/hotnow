import { RawTrendItem, TrendDetail } from "../types";

interface AparatMovieItem {
  id: string;
  type: string;
  attributes: {
    movie_title?: string;
    categories?: Array<string | { title?: string }>;
    countries?: Array<string | { title?: string }>;
    director?: string | { title?: string };
    publish_date?: string | number;
    descr?: string;
    imdb_rate?: string | number;
    duration?: string | number;
    audio?: string[] | string;
    subtitle?: string[] | string;
    badge?: string | { title?: string };
    cover?: string;
  };
}

export async function fetchFilimoPopular(): Promise<RawTrendItem[]> {
  const url =
    "https://www.aparat.com/api/fa/v1/movie/movie/list/tagname/12097123/other_data/movies-popular";

  const res = await fetch(url, {
    next: {
      revalidate: 86400,
      tags: ["analyze-page"],
    },
  });

  if (!res.ok) return [];

  const json = await res.json();
  const includedRaw = Array.isArray(json?.included) ? json.included : [];

  const included = includedRaw as AparatMovieItem[];

  return included
    .filter(
      (item) => item?.type === "movie" && item?.attributes?.movie_title
    )
    .map((item) => {
      const a = item.attributes;

      const genres = Array.isArray(a.categories)
        ? a.categories
            .map((c) => (typeof c === "string" ? c : c.title))
            .filter(Boolean)
        : [];

      const countries = Array.isArray(a.countries)
        ? a.countries
            .map((c) => (typeof c === "string" ? c : c.title))
            .filter(Boolean)
        : [];

      const details: TrendDetail[] = [];

      if (genres.length)
        details.push({
          key: "genre",
          value: genres.join("، "),
        });

      if (a.director)
        details.push({
          key: "director",
          value:
            typeof a.director === "string"
              ? a.director
              : a.director.title || "",
        });

      if (a.publish_date)
        details.push({
          key: "year",
          value: Number(String(a.publish_date).slice(0, 4)),
        });

      if (a.descr)
        details.push({
          key: "description",
          value: a.descr,
        });

      if (a.imdb_rate)
        details.push({
          key: "imdbRate",
          value: Number(a.imdb_rate),
        });

      if (a.duration)
        details.push({
          key: "duration",
          value: Number(a.duration),
        });

      if (countries.length)
        details.push({
          key: "countries",
          value: countries.join("، "),
        });

      if (a.audio)
        details.push({
          key: "audio",
          value: Array.isArray(a.audio) ? a.audio.join("، ") : a.audio,
        });

      if (a.subtitle)
        details.push({
          key: "subtitle",
          value: Array.isArray(a.subtitle)
            ? a.subtitle.join("، ")
            : a.subtitle,
        });

      if (a.badge)
        details.push({
          key: "badge",
          value:
            typeof a.badge === "string" ? a.badge : a.badge.title || "",
        });

      return {
        source: "filimo",
        title: String(a.movie_title).trim(),
        timestamp: Date.now(),
        score: Number(a.imdb_rate) || 0,
        url: item.id ? `https://www.aparat.com/v/${item.id}` : undefined,
        image: a.cover,
        details,
      };
    });
}
