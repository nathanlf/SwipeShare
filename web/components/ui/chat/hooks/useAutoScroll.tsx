import { useCallback, useEffect, useRef, useState } from "react";

interface ScrollState {
  isAtBottom: boolean;
  autoScrollEnabled: boolean;
}

interface UseAutoScrollOptions {
  offset?: number;
  smooth?: boolean;
  content?: React.ReactNode;
  preserveScrollPositionOnContentChange?: boolean;
}

export function useAutoScroll(options: UseAutoScrollOptions = {}) {
  const { 
    offset = 20, 
    smooth = false, 
    content,
    preserveScrollPositionOnContentChange = true
  } = options;
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastContentHeight = useRef(0);
  const lastScrollHeight = useRef(0);
  const lastScrollTop = useRef(0);
  const messagesLengthRef = useRef(0);
  const contentChangeRef = useRef(false);
  const userHasScrolled = useRef(false);

  const [scrollState, setScrollState] = useState<ScrollState>({
    isAtBottom: true,
    autoScrollEnabled: true,
  });

  // Preserve current scroll position and content height
  const saveScrollPosition = useCallback(() => {
    if (!scrollRef.current) return;
    
    lastScrollHeight.current = scrollRef.current.scrollHeight;
    lastScrollTop.current = scrollRef.current.scrollTop;
    
    // Count number of message children to detect content changes
    const messageCount = scrollRef.current.querySelectorAll('[data-message-id]').length;
    
    // If there are more messages than before (but we're not at the bottom), 
    // we likely loaded older messages, so flag for scroll position preservation
    if (messageCount > messagesLengthRef.current && !checkIsAtBottom(scrollRef.current)) {
      contentChangeRef.current = true;
    }
    
    messagesLengthRef.current = messageCount;
  }, []);

  const checkIsAtBottom = useCallback(
    (element: HTMLElement) => {
      const { scrollTop, scrollHeight, clientHeight } = element;
      const distanceToBottom = Math.abs(
        scrollHeight - scrollTop - clientHeight
      );
      return distanceToBottom <= offset;
    },
    [offset]
  );

  const scrollToBottom = useCallback(
    (instant?: boolean) => {
      if (!scrollRef.current) return;

      const targetScrollTop =
        scrollRef.current.scrollHeight - scrollRef.current.clientHeight;

      if (instant) {
        scrollRef.current.scrollTop = targetScrollTop;
      } else {
        scrollRef.current.scrollTo({
          top: targetScrollTop,
          behavior: smooth ? "smooth" : "auto",
        });
      }

      setScrollState({
        isAtBottom: true,
        autoScrollEnabled: true,
      });
      userHasScrolled.current = false;
    },
    [smooth]
  );

  // Restore scroll position after content changes
  const restoreScrollPosition = useCallback(() => {
    if (!scrollRef.current || !contentChangeRef.current) return;
    
    // Calculate how much the content height has changed
    const newScrollHeight = scrollRef.current.scrollHeight;
    const scrollHeightDiff = newScrollHeight - lastScrollHeight.current;
    
    // If the height increased (content was added above), adjust scroll position
    if (scrollHeightDiff > 0 && preserveScrollPositionOnContentChange) {
      scrollRef.current.scrollTop = lastScrollTop.current + scrollHeightDiff;
    }
    
    contentChangeRef.current = false;
  }, [preserveScrollPositionOnContentChange]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;

    const atBottom = checkIsAtBottom(scrollRef.current);

    setScrollState((prev) => ({
      isAtBottom: atBottom,
      // Re-enable auto-scroll if at the bottom
      autoScrollEnabled: atBottom ? true : prev.autoScrollEnabled,
    }));
    
    // Save position on each scroll
    saveScrollPosition();
  }, [checkIsAtBottom, saveScrollPosition]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    element.addEventListener("scroll", handleScroll, { passive: true });
    return () => element.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;
    
    // Check if it's a top load (older messages) or a bottom load (new messages)
    // by seeing if we had scroll position saved
    restoreScrollPosition();

    const currentHeight = scrollElement.scrollHeight;
    const hasNewContent = currentHeight !== lastContentHeight.current;

    if (hasNewContent) {
      if (scrollState.autoScrollEnabled && !contentChangeRef.current) {
        requestAnimationFrame(() => {
          scrollToBottom(lastContentHeight.current === 0);
        });
      }
      lastContentHeight.current = currentHeight;
    }
  }, [content, scrollState.autoScrollEnabled, scrollToBottom, restoreScrollPosition]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    // Save scroll position before resize
    const beforeResize = () => {
      saveScrollPosition();
    };
    
    // Restore after resize
    const afterResize = () => {
      if (scrollState.autoScrollEnabled) {
        scrollToBottom(true);
      } else if (preserveScrollPositionOnContentChange) {
        restoreScrollPosition();
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      beforeResize();
      afterResize();
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [scrollState.autoScrollEnabled, scrollToBottom, saveScrollPosition, restoreScrollPosition, preserveScrollPositionOnContentChange]);

  const disableAutoScroll = useCallback(() => {
    const atBottom = scrollRef.current
      ? checkIsAtBottom(scrollRef.current)
      : false;

    // Only disable if not at bottom
    if (!atBottom) {
      userHasScrolled.current = true;
      setScrollState((prev) => ({
        ...prev,
        autoScrollEnabled: false,
      }));
    }
  }, [checkIsAtBottom]);

  return {
    scrollRef,
    isAtBottom: scrollState.isAtBottom,
    autoScrollEnabled: scrollState.autoScrollEnabled,
    scrollToBottom: () => scrollToBottom(false),
    disableAutoScroll,
    saveScrollPosition,
    restoreScrollPosition,
  };
}