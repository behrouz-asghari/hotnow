import { RawTrendItem, SourceName } from "../types";
import { fetchGoogleTrendsIR } from "./googleTrends";
import { fetchWikiTopFa } from "./wikiTop";
import { fetchNiniSiteHottest } from "./ninisite";
import { fetchKarzarTop } from "./karzar";
import { fetchTgStatTrends } from "./tgstat";
import { fetchDigikalaBestSelling } from "./digikala";
import { fetchFilimoPopular } from "./filimoPopular";

export interface SourceEntry {
  name: SourceName;
  fetcher: () => Promise<RawTrendItem[]>;
  timeoutMs: number;
}

export const SOURCES: SourceEntry[] = [
  { name: "google", fetcher: fetchGoogleTrendsIR, timeoutMs: 6000 },
  { name: "wiki", fetcher: fetchWikiTopFa, timeoutMs: 6000 },
  { name: "ninisite", fetcher: fetchNiniSiteHottest, timeoutMs: 7000 },
  { name: "karzar", fetcher: fetchKarzarTop, timeoutMs: 7000 },
  { name: "tgstat", fetcher: fetchTgStatTrends, timeoutMs: 8000 },
  { name: "digikala", fetcher: fetchDigikalaBestSelling, timeoutMs: 5000 },
  { name: "filimo", fetcher: fetchFilimoPopular, timeoutMs: 7000 },
];
