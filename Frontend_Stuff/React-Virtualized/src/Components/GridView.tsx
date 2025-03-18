import { useEffect, useState } from "react";
import {
  AutoSizer,
  Grid,
  GridCellProps,
  InfiniteLoader,
} from "react-virtualized";
import { motion } from "framer-motion";
import axios from "axios";

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

function GridView() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const TOTAL_ROWS = 100;

  const isRowLoaded = ({ index }: { index: number }) => {
    return !!posts[index];
  };

  const loadMoreRows = async ({
    startIndex,
    stopIndex,
  }: {
    startIndex: number;
    stopIndex: number;
  }) => {
    if (!hasMore || loading) return;
    try {
      setLoading(true);
      const response = await axios.get(
        `https://jsonplaceholder.typicode.com/posts?_start=${startIndex}&_limit=${stopIndex - startIndex + 1}`
      );
      if (response.data.length === 0) {
        setHasMore(false);
        return;
      }
      setPosts((prev) => {
        const newPosts = [...prev];
        response.data.forEach((post: Post, idx: number) => {
          newPosts[startIndex + idx] = post;
        });
        return newPosts;
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (pageNum: number) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://jsonplaceholder.typicode.com/posts?_start=${pageNum * 10}&_limit=10`
      );
      if (response.data.length === 0) {
        setHasMore(false);
        return;
      }
      setPosts((prev) => [...prev, ...response.data]);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = ({
    clientHeight,
    scrollHeight,
    scrollTop,
  }: {
    clientHeight: number;
    scrollHeight: number;
    scrollTop: number;
  }) => {
    if (!hasMore || loading) return;

    const threshold = 50;
    const bottomReached = scrollHeight - scrollTop - clientHeight < threshold;

    if (bottomReached) {
      fetchPosts(page + 1);
    }
  };

  const cellRenderer = ({
    columnIndex,
    key,
    rowIndex,
    style,
  }: GridCellProps) => {
    const post = posts[rowIndex];
    if (!post) return null;

    if (rowIndex === 0) {
      const headers = [
        { text: "ID", width: "20%" },
        { text: "User ID", width: "20%" },
        { text: "Title", width: "60%" },
        { text: "Body", width: "100%" },
      ];
      return (
        <div
          key={key}
          style={style}
          className="bg-gray-100 font-semibold px-4 py-3 border-b border-gray-200 flex items-center justify-center"
        >
          {columnIndex < 3 ? headers[columnIndex].text : headers[3].text}
        </div>
      );
    }
    const actualRowIndex = rowIndex - 1;
    const post2 = posts[actualRowIndex];
    if (!post2) return null;

    if (!post2) {
      return (
        <div
          key={key}
          style={style}
          className="px-4 py-3 border-b border-gray-200 flex items-center justify-center"
        >
          <p className="text-gray-700">Loading...</p>
        </div>
      );
    }
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
          <div className="w-full text-center">{post2.id}</div>
        )}
        {columnIndex === 1 && (
          <div className="w-full text-center">{post2.userId}</div>
        )}
        {columnIndex === 2 && (
          <div className="w-full truncate">{post2.title}</div>
        )}
        {columnIndex === 3 && (
          <div className="w-full truncate">{post2.body}</div>
        )}
      </motion.div>
    );
  };

  useEffect(() => {
    // fetchPosts(0);
    loadMoreRows({ startIndex: 0, stopIndex: 9 });
  }, []);

  console.log("posts", posts);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-[80%] mx-auto py-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-center mb-8 text-gray-800"
        >
          Virtual Grid Table
        </motion.h1>

        <div className="flex gap-4" style={{ marginTop: "50px" }}>
          <div className="w-1/2 bg-white rounded-lg shadow-lg overflow-hidden overflow-x-auto no-scrollbar">
            <div className="h-[70vh]">
              {/* <AutoSizer>
                {({ width, height }) => (
                  <Grid
                    width={width}
                    height={height}
                    columnCount={3}
                    columnWidth={() => width / 3}
                    rowCount={posts.length + 1}
                    rowHeight={70}
                    cellRenderer={cellRenderer}
                    onScroll={handleScroll}
                    className="outline-none"
                  />
                )}
              </AutoSizer> */}
              <InfiniteLoader
                isRowLoaded={isRowLoaded}
                loadMoreRows={loadMoreRows}
                rowCount={TOTAL_ROWS}
                minimumBatchSize={10}
                threshold={5}
              >
                {({ onRowsRendered, registerChild }) => (
                  <AutoSizer>
                    {({ width, height }) => (
                      <Grid
                        ref={registerChild}
                        width={width}
                        height={height}
                        columnCount={3}
                        columnWidth={() => width / 3}
                        rowCount={TOTAL_ROWS + 1}
                        rowHeight={70}
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

          <div className="w-1/2 bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-[70vh]">
              {/* <AutoSizer>
                {({ width, height }) => (
                  <Grid
                    width={width}
                    height={height}
                    columnCount={1}
                    columnWidth={() => width}
                    rowCount={posts.length + 1}
                    rowHeight={70}
                    cellRenderer={({ key, rowIndex, style }) =>
                      cellRenderer({ columnIndex: 3, key, rowIndex, style })
                    }
                    onScroll={handleScroll}
                    className="outline-none"
                  />
                )}
              </AutoSizer> */}
              <InfiniteLoader
                isRowLoaded={isRowLoaded}
                loadMoreRows={loadMoreRows}
                rowCount={TOTAL_ROWS}
                minimumBatchSize={10}
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
                        rowHeight={70}
                        cellRenderer={({ key, rowIndex, style }) =>
                          cellRenderer({ columnIndex: 3, key, rowIndex, style })
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
            <span className="ml-2 text-gray-600">Loading more data...</span>
          </div>
        )}

        {!hasMore && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-600 py-4"
          >
            No more data to load
          </motion.p>
        )}
      </div>
    </div>
  );
}

export default GridView;
