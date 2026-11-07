import { useCallback, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { fetchYouTube, mergeYouTubeLocal } from "@/hooks/useYouTube";
import { youtubeCategoryId, YOUTUBE_CATEGORY_QUERIES } from "@/lib/youtubeCategories";

const PAGE_SIZE = 24;
const CATEGORY_SLUGS = [
  "music", "gaming", "education", "entertainment", "sports",
  "news", "tech", "comedy", "lifestyle",
];

/** YouTube sources loaded one after another as the visitor scrolls. */
function chartSource(slug) {
  return {
    action: "categorySearch",
    params: { categoryId: youtubeCategoryId(slug), maxResults: 50 },
    slug,
    categoryId: youtubeCategoryId(slug),
  };
}

function sourcesFor(filter) {
  if (filter !== "all") {
    return [filter].filter((slug) => youtubeCategoryId(slug)).map(chartSource);
  }
  return [
    { action: "trending", params: { maxResults: 50 } },
    ...CATEGORY_SLUGS.map(chartSource),
  ];
}

/**
 * Streaming feed: successive YouTube charts then local videos page by page,
 * so scrolling never stops at an arbitrary cap.
 */
export default function useStreamFeed(filter = "all") {
  const sources = useMemo(() => sourcesFor(filter), [filter]);

  const query = useInfiniteQuery({
    queryKey: ["stream-feed", filter],
    queryFn: async ({ pageParam }) => {
      const state = pageParam || { sourceIndex: 0, cursor: null };

      if (state.sourceIndex < sources.length) {
        const source = sources[state.sourceIndex];
        let videos = await fetchYouTube(source.action, source.params);

        // A category chart can come back empty for a region: fall back to a search.
        if (!videos?.length && source.categoryId) {
          videos = await fetchYouTube("search", {
            q: YOUTUBE_CATEGORY_QUERIES[source.slug] || source.slug,
            type: "video",
            videoCategoryId: source.categoryId,
            maxResults: 25,
            order: "viewCount",
          });
        }

        return {
          videos: videos || [],
          next: { sourceIndex: state.sourceIndex + 1, cursor: null },
        };
      }

      const page = await base44.entities.Video.filter(
        filter === "all" ? {} : { category: filter },
        {
          sort: "-created_date",
          limit: PAGE_SIZE,
          ...(state.cursor ? { cursor: state.cursor } : {}),
        }
      );
      return {
        videos: page?.items || [],
        next: page?.has_more
          ? { sourceIndex: state.sourceIndex, cursor: page.next_cursor }
          : undefined,
      };
    },
    initialPageParam: { sourceIndex: 0, cursor: null },
    getNextPageParam: (lastPage) => lastPage?.next,
    staleTime: 5 * 60 * 1000,
  });

  const videos = useMemo(() => {
    const all = (query.data?.pages || []).flatMap((page) => page.videos || []);
    return mergeYouTubeLocal(all, []);
  }, [query.data]);

  const loadMore = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
  }, [query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage]);

  return {
    videos,
    isLoading: query.isPending,
    isLoadingMore: query.isFetchingNextPage,
    hasMore: !!query.hasNextPage,
    loadMore,
    refetch: query.refetch,
  };
}