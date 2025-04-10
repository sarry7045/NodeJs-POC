import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Comment, User, Reply } from "./types";

interface Store {
  comments: Comment[];
  users: User[];
  selectedText: { text: string; start: number; end: number } | null;
  activeCommentId: string | null;
  addComment: (comment: Comment) => void;
  addReply: (commentId: string, reply: Reply) => void;
  deleteComment: (commentId: string) => void;
  deleteReply: (commentId: string, replyId: string) => void;
  editComment: (commentId: string, newText: string) => void;
  editReply: (commentId: string, replyId: string, newText: string) => void;
  setSelectedText: (
    selection: { text: string; start: number; end: number } | null
  ) => void;
  setActiveCommentId: (id: string | null) => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      comments: [],
      users: [
        { id: "1", name: "John Doe", avatar: "https://i.pravatar.cc/40?img=4" },
        {
          id: "2",
          name: "Jane Smith",
          avatar: "https://i.pravatar.cc/40?img=2",
        },
        {
          id: "3",
          name: "Bob Johnson",
          avatar: "https://i.pravatar.cc/40?img=3",
        },
      ],
      selectedText: null,
      activeCommentId: null,
      addComment: (comment) =>
        set((state) => ({ comments: [...state.comments, comment] })),
      addReply: (commentId, reply) =>
        set((state) => ({
          comments: state.comments.map((comment) =>
            comment?.id === commentId
              ? { ...comment, replies: [...comment.replies, reply] }
              : comment
          ),
        })),
      deleteComment: (commentId) =>
        set((state) => ({
          comments: state.comments.filter(
            (comment) => comment?.id !== commentId
          ),
        })),
      deleteReply: (commentId, replyId) =>
        set((state) => ({
          comments: state.comments.map((comment) =>
            comment?.id === commentId
              ? {
                  ...comment,
                  replies: comment.replies.filter(
                    (reply) => reply?.id !== replyId
                  ),
                }
              : comment
          ),
        })),
      editComment: (commentId, newText) =>
        set((state) => ({
          comments: state.comments.map((comment) =>
            comment?.id === commentId ? { ...comment, text: newText } : comment
          ),
        })),
      editReply: (commentId, replyId, newText) =>
        set((state) => ({
          comments: state.comments.map((comment) =>
            comment?.id === commentId
              ? {
                  ...comment,
                  replies: comment.replies.map((reply) =>
                    reply?.id === replyId ? { ...reply, text: newText } : reply
                  ),
                }
              : comment
          ),
        })),
      setSelectedText: (selection) => set({ selectedText: selection }),
      setActiveCommentId: (id) => set({ activeCommentId: id }),
    }),
    {
      name: "comments-storage",
    }
  )
);
