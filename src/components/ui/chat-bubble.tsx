import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const chatBubbleVariants = cva(
  "relative inline-block max-w-xs rounded-2xl px-4 py-2 text-sm break-words",
  {
    variants: {
      variant: {
        sent: "bg-blue-500 text-white ml-auto",
        received:
          "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100",
      },
      size: {
        sm: "px-3 py-1.5 text-xs max-w-xs",
        default: "px-4 py-2 text-sm max-w-xs",
        lg: "px-5 py-3 text-base max-w-sm",
      },
    },
    defaultVariants: {
      variant: "received",
      size: "default",
    },
  },
);

const arrowVariants = cva("absolute", {
  variants: {
    position: {
      "top-center": "top-0 left-1/2 -translate-x-1/2 -translate-y-full",
      "bottom-center": "bottom-0 left-1/2 -translate-x-1/2 translate-y-full",
      "left-center": "left-0 top-1/2 -translate-y-1/2 -translate-x-full",
      "right-center": "right-0 top-1/2 -translate-y-1/2 translate-x-full",
    },
    variant: {
      sent: "",
      received: "",
    },
  },
});

type ArrowPosition =
  | "top-center"
  | "bottom-center"
  | "left-center"
  | "right-center";

interface ChatBubbleProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chatBubbleVariants> {
  arrow?: ArrowPosition;
  showArrow?: boolean;
}

const ChatBubble = React.forwardRef<HTMLDivElement, ChatBubbleProps>(
  (
    {
      className,
      variant,
      size,
      arrow = "bottom-center",
      showArrow = true,
      children,
      ...props
    },
    ref,
  ) => {
    const getArrowPath = (
      position: ArrowPosition,
      bubbleVariant = "received",
    ) => {
      const isBlue = bubbleVariant === "sent";
      const fillColor = isBlue ? "#3b82f6" : "currentColor";

      switch (position) {
        case "top-center":
          return (
            <svg
              width="12"
              height="6"
              viewBox="0 0 12 6"
              className="text-gray-200 dark:text-gray-700"
            >
              <path
                d="M0 6L6 0L12 6"
                fill={isBlue ? "#3b82f6" : fillColor}
                className={!isBlue ? "text-gray-200 dark:text-gray-700" : ""}
              />
            </svg>
          );
        case "bottom-center":
          return (
            <svg
              width="12"
              height="6"
              viewBox="0 0 12 6"
              className="text-gray-200 dark:text-gray-700"
            >
              <path
                d="M0 0L6 6L12 0"
                fill={isBlue ? "#3b82f6" : fillColor}
                className={!isBlue ? "text-gray-200 dark:text-gray-700" : ""}
              />
            </svg>
          );
        case "left-center":
          return (
            <svg
              width="6"
              height="12"
              viewBox="0 0 6 12"
              className="text-gray-200 dark:text-gray-700"
            >
              <path
                d="M6 0L0 6L6 12"
                fill={isBlue ? "#3b82f6" : fillColor}
                className={!isBlue ? "text-gray-200 dark:text-gray-700" : ""}
              />
            </svg>
          );
        case "right-center":
          return (
            <svg
              width="6"
              height="12"
              viewBox="0 0 6 12"
              className="text-gray-200 dark:text-gray-700"
            >
              <path
                d="M0 0L6 6L0 12"
                fill={isBlue ? "#3b82f6" : fillColor}
                className={!isBlue ? "text-gray-200 dark:text-gray-700" : ""}
              />
            </svg>
          );
        default:
          return null;
      }
    };

    return (
      <div
        ref={ref}
        className={cn(chatBubbleVariants({ variant, size, className }))}
        {...props}
      >
        {children}
        {showArrow && (
          <div className={cn(arrowVariants({ position: arrow, variant }))}>
            {getArrowPath(arrow, variant || "received")}
          </div>
        )}
      </div>
    );
  },
);
ChatBubble.displayName = "ChatBubble";

export {
  ChatBubble,
  chatBubbleVariants,
  type ChatBubbleProps,
  type ArrowPosition,
};
