import React, { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { Trash2, Pencil, X, Check } from "lucide-react";
import { useStore } from "../Store";

export const CommentSection = () => {
  const {
    comments,
    users,
    selectedText,
    activeCommentId,
    addComment,
    addReply,
    deleteComment,
    deleteReply,
    editComment,
    editReply,
    setSelectedText,
  } = useStore();

  const [newComment, setNewComment] = useState("");
  const [replyTexts, setReplyTexts] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [editingReply, setEditingReply] = useState(null);
  const [editText, setEditText] = useState("");
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);
  const [showReplyUserSuggestions, setShowReplyUserSuggestions] =
    useState(false);
  const [showReplyField, setShowReplyField] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const commentInputRef = useRef(null);
  const [activeCommentRef, setActiveCommentRef] = useState(null);

  useEffect(() => {
    if (activeCommentId) {
      const commentElement = document.querySelector(
        `[data-comment-container="${activeCommentId}"]`
      );
      if (commentElement) {
        setActiveCommentRef(commentElement);
        commentElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
        commentElement.classList.add("comment-highlight");
        setTimeout(() => {
          commentElement.classList.remove("comment-highlight");
        }, 2000);
      }
    }
  }, [activeCommentId]);

  const handleAddComment = (e) => {
    e.stopPropagation();
    if (!selectedText || !newComment.trim()) return;

    addComment({
      id: Math.random().toString(),
      text: newComment,
      userId: "1",
      timestamp: new Date(),
      replies: [],
      selection: selectedText,
    });
    setNewComment("");
  };

  const handleCancelComment = (e) => {
    e.stopPropagation();
    setShowReplyField(false);
    setSelectedText(null);
  };

  const handleAddReply = (e, commentId) => {
    e.stopPropagation();
    const replyText = replyTexts[commentId];
    if (!replyText?.trim()) return;

    addReply(commentId, {
      id: Math.random().toString(),
      text: replyText,
      userId: "1",
      timestamp: new Date(),
    });
    setReplyTexts((prev) => ({ ...prev, [commentId]: "" }));
  };

  const handleInputChange = (e, isReply = false, commentId = "") => {
    e.stopPropagation();
    const value = e.target.value;
    const ID = e.target.id;
    if (isReply) {
      setReplyTexts((prev) => ({ ...prev, [commentId]: value }));
    } else {
      setNewComment(value);
    }

    if (value.includes("@") && ID === "Comment") {
      const query = value.split("@").pop() || "";
      setUserQuery(query);
      setShowUserSuggestions(true);
    } else {
      setShowUserSuggestions(false);
    }

    if (value.includes("@") && ID === "Reply") {
      const query = value.split("@").pop() || "";
      setUserQuery(query);
      setShowReplyUserSuggestions(true);
    } else {
      setShowReplyUserSuggestions(false);
    }
  };

  const handleUserSelect = (e, user, isReply = false, commentId = "") => {
    e.stopPropagation();
    const inputRef = isReply
      ? document.querySelector(`[data-reply-input="${commentId}"]`)
      : commentInputRef.current;
    const currentText = isReply ? replyTexts[commentId] || "" : newComment;

    if (inputRef) {
      const cursorPosition = inputRef.selectionStart || 0;
      const textBeforeCursor = currentText.slice(0, cursorPosition);
      const textAfterCursor = currentText.slice(cursorPosition);
      const lastAtSymbol = textBeforeCursor.lastIndexOf("@");

      if (lastAtSymbol !== -1) {
        const newText =
          textBeforeCursor.slice(0, lastAtSymbol) +
          `@${user.name} ` +
          textAfterCursor;

        if (isReply) {
          setReplyTexts((prev) => ({ ...prev, [commentId]: newText }));
        } else {
          setNewComment(newText);
        }

        setTimeout(() => {
          inputRef.focus();
          const newCursorPosition = lastAtSymbol + user.name.length + 2;
          inputRef.setSelectionRange(newCursorPosition, newCursorPosition);
        }, 0);
      }
    }
    setShowUserSuggestions(false);
    setShowReplyUserSuggestions(false);
  };

  const startEditing = (e, type, commentId, replyId) => {
    e.stopPropagation();
    const text =
      type === "comment"
        ? comments.find((c) => c.id === commentId)?.text
        : comments
            .find((c) => c.id === commentId)
            ?.replies.find((r) => r.id === replyId)?.text;

    if (text) {
      setEditText(text);
      if (type === "comment") {
        setEditingComment(commentId);
      } else if (replyId) {
        setEditingReply({ commentId, replyId });
      }
    }
  };

  const saveEdit = (e) => {
    e.stopPropagation();
    if (editingComment) {
      editComment(editingComment, editText);
      setEditingComment(null);
    } else if (editingReply) {
      editReply(editingReply.commentId, editingReply.replyId, editText);
      setEditingReply(null);
    }
    setEditText("");
  };

  const cancelEdit = (e) => {
    e.stopPropagation();
    setEditingComment(null);
    setEditingReply(null);
    setEditText("");
  };

  const handleShowReplyField = (e) => {
    e.stopPropagation();
    setShowReplyField(true);
  };

  const groupedComments = comments.reduce((acc, comment) => {
    const key = comment.selection.text;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(comment);
    return acc;
  }, {});

  return (
    <div
      className="comment-section w-96 h-screen border-l border-gray-200 bg-white overflow-y-auto"
      style={{ width: "440px", userSelect: "none" }}
    >
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Comments</h2>
        {selectedText && (
          <div className="mb-4">
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Selected text:</p>
              <p className="text-sm font-medium">{selectedText.text}</p>
            </div>
            <div className="mt-3">
              <div className="relative">
                <input
                  ref={commentInputRef}
                  type="text"
                  data-reply-input={"1"}
                  value={newComment}
                  onChange={(e) => handleInputChange(e)}
                  placeholder="Comment or add other with @"
                  className="w-full p-2 border rounded-lg pr-10"
                  id="Comment"
                />
                <span className="justify-end flex">
                  <button
                    className="my-2 rounded-full border border-slate-300 py-1 px-3 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-white hover:bg-slate-600 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                    type="button"
                    onClick={(e) => handleCancelComment(e)}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={(e) => handleAddComment(e)}
                    className="my-2 ml-2 rounded-full border border-slate-300 py-1 px-3 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-100 hover:text-white hover:bg-slate-800 bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                    type="button"
                  >
                    Comment
                  </button>
                </span>
                {showUserSuggestions && (
                  <div
                    className="absolute bg-white shadow-lg rounded-lg mt-1 w-60 z-50"
                    style={{ marginTop: "-45px" }}
                  >
                    {users
                      .filter((user) =>
                        user.name
                          .toLowerCase()
                          .includes(userQuery.toLowerCase())
                      )
                      .map((user) => (
                        <div
                          key={user.id}
                          onClick={(e) =>
                            handleUserSelect(e, user, true, user.id)
                          }
                          className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
                        >
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-6 h-6 rounded-full mr-2"
                          />
                          <span>{user.name}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="space-y-6">
          {Object.entries(groupedComments).map(
            ([selectionText, commentsGroup]) => (
              <div key={selectionText} className="border-b pb-4">
                <div className="bg-yellow-50 p-2 rounded mb-2">
                  <p className="text-sm font-medium">{selectionText}</p>
                </div>
                <div className="space-y-4">
                  {commentsGroup.map((comment) => (
                    <div
                      key={comment.id}
                      data-comment-container={comment.id}
                      className="bg-gray-50 rounded-lg p-4 transition-all duration-500 cursor-pointer hover:bg-blue-100"
                      onClick={(e) => handleShowReplyField(e)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <img
                            src={
                              users.find((u) => u.id === comment.userId)?.avatar
                            }
                            alt="User"
                            className="w-8 h-8 rounded-full mr-2"
                          />
                          <div>
                            <p className="font-medium">
                              {users.find((u) => u.id === comment.userId)?.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {format(
                                new Date(comment.timestamp),
                                "MMM d, yyyy h:mm a"
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            title="Mark as Resolved"
                            className="text-gray-400 hover:text-blue-500"
                            onClick={() => deleteComment(comment.id)}
                          >
                            <Check size={18} className="text-blue-500" />
                          </button>
                          <button
                            onClick={(e) =>
                              startEditing(e, "comment", comment.id)
                            }
                            className="text-gray-400 hover:text-blue-500"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => deleteComment(comment.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      {editingComment === comment.id ? (
                        <div className="mt-2">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full p-2 border rounded"
                            autoFocus
                          />
                          <div className="flex justify-end space-x-2 mt-2">
                            <button
                              onClick={cancelEdit}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <X size={17} />
                            </button>
                            <button
                              onClick={saveEdit}
                              className="text-green-500 hover:text-green-700"
                            >
                              <Check size={17} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-2">{comment.text}</p>
                      )}
                      <div className="mt-3 space-y-3">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="pl-8 mt-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center">
                                <img
                                  src={
                                    users.find((u) => u.id === reply.userId)
                                      ?.avatar
                                  }
                                  alt="User"
                                  className="w-6 h-6 rounded-full mr-2"
                                />
                                <div>
                                  <p className="font-medium text-sm">
                                    {
                                      users.find((u) => u.id === reply.userId)
                                        ?.name
                                    }
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {format(
                                      new Date(reply.timestamp),
                                      "MMM d, yyyy h:mm a"
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={(e) =>
                                    startEditing(
                                      e,
                                      "reply",
                                      comment.id,
                                      reply.id
                                    )
                                  }
                                  className="text-gray-400 hover:text-blue-500"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() =>
                                    deleteReply(comment.id, reply.id)
                                  }
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                            {editingReply?.commentId === comment.id &&
                            editingReply?.replyId === reply.id ? (
                              <div className="mt-2">
                                <input
                                  type="text"
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="w-full p-1.5 text-sm border rounded"
                                  autoFocus
                                />
                                <div className="flex justify-end space-x-2 mt-1">
                                  <button
                                    onClick={cancelEdit}
                                    className="text-gray-500 hover:text-gray-700"
                                  >
                                    <X size={16} />
                                  </button>
                                  <button
                                    onClick={saveEdit}
                                    className="text-green-500 hover:text-green-700"
                                  >
                                    <Check size={16} />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="mt-1 text-sm">{reply.text}</p>
                            )}
                          </div>
                        ))}
                        {showReplyField && (
                          <div className="pl-8 mt-2">
                            <div className="flex items-center space-x-2 relative">
                              <input
                                type="text"
                                data-reply-input={comment.id}
                                value={replyTexts[comment.id] || ""}
                                onChange={(e) =>
                                  handleInputChange(e, true, comment.id)
                                }
                                placeholder="Reply or add others with @"
                                className="flex-1 p-1.5 text-sm border rounded"
                                id="Reply"
                              />
                              {showReplyUserSuggestions && (
                                <div className="absolute bottom-full left-0 bg-white shadow-lg rounded-lg mb-1 w-60 z-50">
                                  {users
                                    .filter((user) =>
                                      user.name
                                        .toLowerCase()
                                        .includes(userQuery.toLowerCase())
                                    )
                                    .map((user) => (
                                      <div
                                        key={user.id}
                                        onClick={(e) =>
                                          handleUserSelect(
                                            e,
                                            user,
                                            true,
                                            comment.id
                                          )
                                        }
                                        className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
                                      >
                                        <img
                                          src={user.avatar}
                                          alt={user.name}
                                          className="w-6 h-6 rounded-full mr-2"
                                        />
                                        <span>{user.name}</span>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </div>
                            <span className="justify-end flex">
                              <button
                                className="my-2 rounded-full border border-slate-300 py-1 px-3 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-white hover:bg-slate-600 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                                type="button"
                                onClick={(e) => handleCancelComment(e)}
                              >
                                Cancel
                              </button>
                              <button
                                onClick={(e) => handleAddReply(e, comment.id)}
                                className="my-2 ml-2 rounded-full border border-slate-300 py-1 px-3 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-100 hover:text-white hover:bg-slate-800 bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                                type="button"
                              >
                                Reply
                              </button>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
