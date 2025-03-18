import { useEffect, useState, useRef } from "react";
import {
  AutoSizer,
  Grid,
  GridCellProps,
  InfiniteLoader,
} from "react-virtualized";
import axios from "axios";
import { motion } from "framer-motion";

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
}

export interface Section {
  [key: string]: Post[];
}

interface ApiResponse {
  section1: Post[];
  section2: Post[];
  section3: Post[];
}

function SectionBasedView() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadedSections = useRef(new Set<number>());
  const currentSection = useRef(1);

  const POSTS_PER_SECTION = 10;
  const TOTAL_SECTIONS = 3;
  const TOTAL_ROWS = POSTS_PER_SECTION * TOTAL_SECTIONS;

  const isRowLoaded = ({ index }: { index: number }) => {
    return !!posts[index];
  };

  const getSectionNumber = (index: number) => {
    return Math.floor(index / POSTS_PER_SECTION) + 1;
  };

  const fetchPostsForSection = async (section: number) => {
    const start = (section - 1) * POSTS_PER_SECTION + 1;
    const end = start + POSTS_PER_SECTION - 1;
    const response = await axios.get(
      `https://jsonplaceholder.typicode.com/posts?_start=${start - 1}&_limit=${POSTS_PER_SECTION}`
    );

    return response.data.map((post: any) => ({
      id: post.id,
      title: post.title,
      content: post.body,
      author: `Author ${post.userId}`,
      date: new Date(Date.now() - Math.random() * 10000000000)
        .toISOString()
        .split("T")[0],
    }));
  };

  const loadMoreRows = async ({
    startIndex,
    stopIndex,
  }: {
    startIndex: number;
    stopIndex: number;
  }) => {
    if (!hasMore || loading) return;
    const sectionToLoad = getSectionNumber(startIndex);

    // Don't load if we've already loaded this section or if we're scrolling up
    if (
      loadedSections.current.has(sectionToLoad) ||
      sectionToLoad < currentSection?.current
    ) {
      return;
    }

    try {
      setLoading(true);
    //   const sectionData = await fetchPostsForSection(sectionToLoad);

        const response = await new Promise<ApiResponse>((resolve) => {
          setTimeout(() => {
            resolve({
              section1: [
                {
                  id: 1,
                  title: "Post One",
                  author: "Alice",
                  date: "2025-03-17",
                  content: "This is the content of post one.",
                },
                {
                  id: 2,
                  title: "Post Two",
                  author: "Bob",
                  date: "2025-03-16",
                  content: "This is the content of post two.",
                },
              ],
              section2: [
                {
                  id: 5,
                  title: "Post Five",
                  author: "Eve",
                  date: "2025-03-13",
                  content: "This is the content of post five.",
                },
                {
                  id: 6,
                  title: "Post Six",
                  author: "Frank",
                  date: "2025-03-12",
                  content: "This is the content of post six.",
                },
              ],
              section3: [
                {
                  id: 9,
                  title: "Post Nine",
                  author: "Ivy",
                  date: "2025-03-09",
                  content: "This is the content of post nine.",
                },
                {
                  id: 10,
                  title: "Post Ten",
                  author: "Jake",
                  date: "2025-03-08",
                  content: "This is the content of post ten.",
                },
              ],
            });
          }, 500);
        });

        const sectionData =
          response[`section${sectionToLoad}` as keyof ApiResponse];

      if (!sectionData || sectionData.length === 0) {
        setHasMore(false);
        return;
      }

      setPosts((prev) => {
        const newPosts = [...prev];
        sectionData.forEach((post: Post, idx: number) => {
          const insertIndex = (sectionToLoad - 1) * POSTS_PER_SECTION + idx;
          newPosts[insertIndex] = post;
        });
        return newPosts;
      });

      loadedSections.current.add(sectionToLoad);
      currentSection.current = sectionToLoad;

      if (sectionToLoad >= TOTAL_SECTIONS) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const cellRenderer = ({
    columnIndex,
    key,
    rowIndex,
    style,
  }: GridCellProps) => {
    if (rowIndex === 0) {
      const headers = [
        { text: "ID", width: "15%" },
        { text: "Title", width: "25%" },
        { text: "Author", width: "20%" },
        { text: "Date", width: "20%" },
        { text: "Content", width: "100%" },
      ];
      return (
        <div
          key={key}
          style={style}
          className="bg-gray-100 font-semibold px-4 py-3 border-b border-gray-200 flex items-center"
        >
          {columnIndex < 4 ? headers[columnIndex].text : headers[4].text}
        </div>
      );
    }
    const actualRowIndex = rowIndex - 1;
    const post = posts[actualRowIndex];

    // if (!post) {
    //   return (
    //     <div
    //       key={key}
    //       style={style}
    //       className="px-4 py-3 border-b border-gray-200 flex items-center justify-center"
    //     >
    //       <p>Loading....</p>
    //     </div>
    //   );
    // }

    return (
      <motion.div
        key={key}
        style={style}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: actualRowIndex * 0.05 }}
        className="px-4 py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150 flex items-center"
      >
        {columnIndex === 0 && (
          <div className="w-full text-center">{post?.id}</div>
        )}
        {columnIndex === 1 && (
          <div className="w-full truncate">{post?.title}</div>
        )}
        {columnIndex === 2 && (
          <div className="w-full text-center">{post?.author}</div>
        )}
        {columnIndex === 3 && (
          <div className="w-full text-center">{post?.date}</div>
        )}
        {columnIndex === 4 && (
          <div className="w-full truncate">{post?.content}</div>
        )}
      </motion.div>
    );
  };

  useEffect(() => {
    loadMoreRows({ startIndex: 0, stopIndex: POSTS_PER_SECTION - 1 });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-[90%] mx-auto py-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-center mb-8 text-gray-800"
        >
          Section-Based Virtual Grid
        </motion.h1>

        <div className="flex gap-4">
          <div className="w-3/5 bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-[70vh]">
              <InfiniteLoader
                isRowLoaded={isRowLoaded}
                loadMoreRows={loadMoreRows}
                rowCount={TOTAL_ROWS}
                minimumBatchSize={POSTS_PER_SECTION}
                threshold={5}
              >
                {({ onRowsRendered, registerChild }) => (
                  <AutoSizer>
                    {({ width, height }) => (
                      <Grid
                        ref={registerChild}
                        width={width}
                        height={height}
                        columnCount={4}
                        columnWidth={() => width / 4}
                        rowCount={TOTAL_ROWS + 1}
                        rowHeight={60}
                        cellRenderer={cellRenderer}
                        onSectionRendered={({
                          rowStartIndex,
                          rowStopIndex,
                        }) => {
                          onRowsRendered({
                            startIndex: rowStartIndex,
                            stopIndex: rowStopIndex,
                          });
                        }}
                        className="outline-none"
                      />
                    )}
                  </AutoSizer>
                )}
              </InfiniteLoader>
            </div>
          </div>

          <div className="w-2/5 bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-[70vh]">
              <InfiniteLoader
                isRowLoaded={isRowLoaded}
                loadMoreRows={loadMoreRows}
                rowCount={TOTAL_ROWS}
                minimumBatchSize={POSTS_PER_SECTION}
                threshold={5}
              >
                {({ onRowsRendered, registerChild }) => (
                  <AutoSizer>
                    {({ width, height }) => (
                      <Grid
                        ref={registerChild}
                        width={width}
                        height={height}
                        columnCount={1}
                        columnWidth={() => width}
                        rowCount={TOTAL_ROWS + 1}
                        rowHeight={60}
                        cellRenderer={({ key, rowIndex, style }) =>
                          cellRenderer({ columnIndex: 4, key, rowIndex, style })
                        }
                        onSectionRendered={({
                          rowStartIndex,
                          rowStopIndex,
                        }) => {
                          onRowsRendered({
                            startIndex: rowStartIndex,
                            stopIndex: rowStopIndex,
                          });
                        }}
                        className="outline-none"
                      />
                    )}
                  </AutoSizer>
                )}
              </InfiniteLoader>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-4">
            <span className="ml-2 text-gray-600">
              Loading section {currentSection?.current}...
            </span>
          </div>
        )}

        {!hasMore && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-600 py-4"
          >
            All sections loaded
          </motion.p>
        )}
      </div>
    </div>
  );
}

export default SectionBasedView;
