import { useEffect, useState } from "react";
import { AutoSizer, List, ListRowProps } from "react-virtualized";
import { motion } from "framer-motion";
import axios from "axios";

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

function ListView() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async (pageNum: number) => {
    try {
      const startIndex = (pageNum - 1) * 10 + 1;
      const response = await axios.get(
        // `https://jsonplaceholder.typicode.com/posts?_page=${pageNum}&_limit=10`
        `https://jsonplaceholder.typicode.com/posts?_start=${startIndex - 1}&_limit=10`
      );
      if (response?.data.length === 0) {
        setHasMore(false);
        return;
      }
      const modifiedData = response?.data.map((post: Post, index: number) => ({
        ...post,
        id: startIndex + index,
      }));
      setPosts((prev) => [...prev, ...modifiedData]);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, []);

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
      setLoading(true);
      setPage((prev) => prev + 1);
      fetchPosts(page + 1);
    }
  };

  const rowRenderer = ({ key, index, style }: ListRowProps) => {
    const post = posts[index];
    if (!post) return null;

    return (
      <motion.tr
        key={key}
        style={{
          ...style,
          display: "flex",
          alignItems: "center",
          width: "100%",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
      >
        <td className="py-4 px-6 w-[10%] text-center">{post?.id}</td>
        <td className="py-4 px-6 w-[15%] text-center">{post?.userId}</td>
        <td className="py-4 px-6 w-[30%] truncate">{post?.title}</td>
        <td className="py-4 px-6 w-[45%] truncate">{post?.body}</td>
      </motion.tr>
    );
  };

  console.log("posts", posts);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-[80%] mx-auto py-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-center mb-8 text-gray-800"
        >
          Virtual Scrolling Table
        </motion.h1>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr className="text-left">
                <th className="py-4 px-6 w-[10%] text-center">ID</th>
                <th className="py-4 px-6 w-[15%] text-center">User ID</th>
                <th className="py-4 px-6 w-[30%]">Title</th>
                <th className="py-4 px-6 w-[45%]">Body</th>
              </tr>
            </thead>
          </table>
          <div className="h-[70vh]">
            <AutoSizer>
              {({ width, height }) => (
                <List
                  width={width}
                  height={height}
                  rowCount={posts.length}
                  rowHeight={70}
                  rowRenderer={rowRenderer}
                  onScroll={handleScroll}
                  className="outline-none"
                />
              )}
            </AutoSizer>
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

export default ListView;
