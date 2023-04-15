import { logger } from "../logger.js";

export interface VintedItem {
  id: number;
  title: string;
  price: string;
  is_visible: number;
  discount: any;
  currency: string;
  brand_title: string;
  is_for_swap: boolean;
  user: User;
  url: string;
  promoted: boolean;
  photo: Photo;
  favourite_count: number;
  is_favourite: boolean;
  favourite_group_id: any;
  badge: any;
  conversion: any;
  service_fee: string;
  shipping_fee: any;
  total_item_price: string;
  view_count: number;
  size_title: string;
  content_source: string;
  search_tracking_params: SearchTrackingParams;
}

export interface User {
  id: number;
  login: string;
  business: boolean;
  profile_url: string;
  photo: UserPicture;
}

export interface UserPicture {
  id: number;
  width: number;
  height: number;
  temp_uuid: any;
  url: string;
  dominant_color: string;
  dominant_color_opaque: string;
  thumbnails: Thumbnail[];
  is_suspicious: boolean;
  orientation: any;
  reaction: any;
  high_resolution: HighResolution;
  full_size_url: string;
  is_hidden: boolean;
  extra: unknown;
}

export interface Thumbnail {
  type: string;
  url: string;
  width: number;
  height: number;
  original_size: unknown;
}

export interface HighResolution {
  id: string;
  timestamp: number;
  orientation: unknown;
}

export interface Photo {
  id: number;
  image_no: number;
  width: number;
  height: number;
  dominant_color: string;
  dominant_color_opaque: string;
  url: string;
  is_main: boolean;
  thumbnails: Thumbnail[];
  high_resolution: HighResolution;
  is_suspicious: boolean;
  full_size_url: string;
  is_hidden: boolean;
  extra: unknown;
}

export interface SearchTrackingParams {
  buyer_item_distance_km: any;
  score: unknown;
  matched_queries: string[];
}

let token: string | null = null;

/**
 * Fetches a new public cookie from Vinted.fr
 */
async function getToken(): Promise<string> {
  const controller = new AbortController();
  try {
    const res = await fetch(`https://vinted.fr`, {
      signal: controller.signal,
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/111.0",
      },
    });
    const cookies = res.headers.get("set-cookie");
    controller.abort();

    // cookies are a=b;c=d; ...
    const c = cookies?.split(";").map((rawCookie) => {
      const [key = "", val = ""] = rawCookie.split("=");

      return {
        key: key.trim(),
        value: val.trim(),
      };
    });

    const sessionCookie = c?.find(
      (cookie) => cookie.key === "secure, _vinted_fr_session"
    );

    if (!sessionCookie) {
      throw new Error("could not find session cookie");
    }

    return sessionCookie.value;
  } catch (err) {
    throw new Error("failed to get session cookie", { cause: err });
  }
}

export async function searchVinted(query: string): Promise<VintedItem[]> {
  const baseURL = "https://www.vinted.fr/api/v2/catalog/items";

  logger.debug("requesting vinted with url", baseURL, "query", query);

  if (token === null) {
    token = await getToken();
  }

  const res = await fetch(`${baseURL}?${query}`, {
    headers: {
      cookie: `_vinted_fr_session=${token}`,
      accept: "application/json, text/plain, */*",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/111.0",
    },
  });
  if (res.status >= 400) {
    const msg = await res.json();

    logger.error("requesting vinted API", msg);
    throw new Error("search request to vinted failed", { cause: msg });
  }

  const json = await res.json();
  if (typeof json === "object" && json !== null && "items" in json) {
    return json.items as Array<VintedItem>;
  }

  throw new Error("bad data format from vinted API");
}
