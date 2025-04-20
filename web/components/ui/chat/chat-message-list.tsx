import * as React from "react";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAutoScroll } from "@/components/ui/chat/hooks/useAutoScroll";

interface ChatMessageListProps extends React.HTMLAttributes<HTMLDivElement> {
  smooth?: boolean;
  onScrollToTop?: () => void;
  isLoadingMore?: boolean;
}

const ChatMessageList = React.forwardRef<HTMLDivElement, ChatMessageListProps>(
  ({ 
    className, 
    children, 
    smooth = true, 
    onScrollToTop,
    isLoadingMore = false,
    ...props 
  }, ref) => {
    const {
      scrollRef,
      isAtBottom,
      scrollToBottom,
      disableAutoScroll,
    } = useAutoScroll({
      smooth,
      content: children,
    });
    
    // Track scroll position to detect when user is at the top
    const handleScroll = React.useCallback(() => {
      if (!scrollRef.current) return;
      
      // If scroll position is at or near the top and we have a callback, trigger it
      if (scrollRef.current.scrollTop <= 10 && onScrollToTop) {
        onScrollToTop();
      }
    }, [onScrollToTop, scrollRef]);

    // Add scroll event listener
    React.useEffect(() => {
      const element = scrollRef.current;
      if (!element) return;

      element.addEventListener("scroll", handleScroll, { passive: true });
      return () => element.removeEventListener("scroll", handleScroll);
    }, [handleScroll, scrollRef]);

    return (
      <div className="relative w-full h-full" ref={ref}>
        {isLoadingMore && (
          <div className="absolute top-0 left-0 right-0 z-10 bg-background/80 text-center py-2 text-sm text-muted-foreground">
            Loading more messages...
          </div>
        )}
        
        <div
          className={`flex flex-col w-full h-full p-4 overflow-y-auto ${smooth ? "scroll-smooth" : ""} ${className}`}
          ref={scrollRef}
          onWheel={disableAutoScroll}
          onTouchMove={disableAutoScroll}
          {...props}
        >
          <div className="flex flex-col gap-6">{children}</div>
        </div>

        {!isAtBottom && (
          <Button
            onClick={() => {
              scrollToBottom();
            }}
            size="icon"
            variant="secondary"
            className="absolute bottom-2 left-1/2 transform -translate-x-1/2 inline-flex rounded-full shadow-md"
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }
);

ChatMessageList.displayName = "ChatMessageList";

export { ChatMessageList };