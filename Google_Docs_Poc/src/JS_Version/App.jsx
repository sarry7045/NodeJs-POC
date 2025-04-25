import { useEffect, useRef } from "react";
import { CommentSection } from "./CommentSection";
import { useStore } from "./Store";

const sampleText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`;

function App() {
  const { comments, setSelectedText, setActiveCommentId } = useStore();
  const contentRef = useRef(null);
  const lastSelectionRef = useRef(null);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        if (!document.activeElement?.closest(".comment-section")) {
          setSelectedText(null);
        } else if (lastSelectionRef.current) {
          setSelectedText(lastSelectionRef.current);
        }
        return;
      }

      const range = selection.getRangeAt(0);
      const text = range.toString().trim();

      if (text && contentRef.current) {
        const start = range.startOffset;
        const end = range.endOffset;
        const selectionData = { text, start, end };
        lastSelectionRef.current = selectionData;
        setSelectedText(selectionData);
      }
    };

    document.addEventListener("mouseup", handleSelection);
    return () => document.removeEventListener("mouseup", handleSelection);
  }, [setSelectedText]);

  useEffect(() => {
    if (contentRef.current) {
      const content = sampleText;
      const spans = [];
      let lastIndex = 0;

      const sortedComments = [...comments].sort(
        (a, b) => a.selection.start - b.selection.start
      );

      for (const comment of sortedComments) {
        const { start, end, text } = comment.selection;
        if (start >= lastIndex) {
          spans.push(content.slice(lastIndex, start));
          spans.push(
            `<span class="bg-yellow-100 cursor-pointer" data-comment-id="${comment.id}">${text}</span>`
          );
          lastIndex = end;
        }
      }
      spans.push(content.slice(lastIndex));

      contentRef.current.innerHTML = spans.join("");

      const highlightedSpans = contentRef.current.getElementsByTagName("span");
      Array.from(highlightedSpans).forEach((span) => {
        span.addEventListener("click", () => {
          const commentId = span.getAttribute("data-comment-id");
          if (commentId) {
            setActiveCommentId(commentId);
          }
        });
      });
    }
  }, [comments, setActiveCommentId]);

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold mb-6">Document Title</h1>
          <div
            ref={contentRef}
            className="prose prose-lg"
            style={{ whiteSpace: "pre-wrap" }}
          >
            {sampleText}
          </div>
        </div>
      </div>
      <CommentSection />
    </div>
  );
}

export default App;
