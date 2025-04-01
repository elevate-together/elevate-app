import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDown, XIcon, ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * Variants for the multi-select component to handle different styles.
 * Uses class-variance-authority (cva) to define different styles based on "variant" prop.
 */
const multiSelectVariants = cva("px-2 py-1 mr-1", {
  variants: {
    variant: {
      default:
        "border-border text-card-foreground bg-muted-background hover:bg-muted hover:border-primary shadow-none",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

/**
 * Props for MultiSelect component
 */
export interface MultiSelectProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof multiSelectVariants> {
  options: {
    label: string;
    value: string;
    type: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  onValueChange: (value: string[]) => void;
  defaultValue?: string[];
  placeholder?: string;
  maxCount?: number;
  specialSelection?: boolean;
  isParentOpen?: boolean;

  /**
   * The modality of the popover. When set to true, interaction with outside elements
   * will be disabled and only popover content will be visible to screen readers.
   * Optional, defaults to false.
   */
  modalPopover?: boolean;
  asChild?: boolean;
  className?: string;
}

export const MultiSelect = React.forwardRef<
  HTMLButtonElement,
  MultiSelectProps
>(
  (
    {
      options,
      onValueChange,
      variant,
      defaultValue = [],
      placeholder = "Select options",
      specialSelection = false,
      maxCount = 3,
      modalPopover = false,
      isParentOpen = false,
      // asChild = false,
      className,
      ...props
    },
    ref
  ) => {
    const [selectedValues, setSelectedValues] =
      React.useState<string[]>(defaultValue);
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

    const toggleOption = (option: string) => {
      let newSelectedValues;

      if (specialSelection) {
        if (option === "1" || option === "2") {
          // If '1' or '2' is selected, deselect all other options and select only the clicked one
          newSelectedValues = [option];
        } else {
          newSelectedValues = selectedValues.includes(option)
            ? selectedValues.filter((value) => value !== option)
            : [
                ...selectedValues.filter(
                  (value) => value !== "1" && value !== "2"
                ),
                option,
              ];
        }
      } else {
        newSelectedValues = selectedValues.includes(option)
          ? selectedValues.filter((value) => value !== option)
          : [...selectedValues, option];
      }

      setSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    };

    const handleClear = () => {
      setSelectedValues([]);
      onValueChange([]);
    };

    const handleTogglePopover = () => {
      setIsPopoverOpen((prev) => !prev);
    };

    return (
      <Popover
        open={isPopoverOpen && isParentOpen}
        onOpenChange={setIsPopoverOpen}
        modal={isParentOpen && modalPopover}
      >
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            {...props}
            onClick={handleTogglePopover}
            className={cn(
              "flex w-full p-1 rounded-md border min-h-10 h-auto items-center justify-between bg-inherit hover:bg-inherit [&_svg]:pointer-events-auto shadow-none",
              isPopoverOpen ? "border-black" : "border-border",
              className
            )}
          >
            {selectedValues.length > 0 ? (
              <div className="flex justify-between items-center w-full">
                <div className="flex flex-wrap items-center">
                  {selectedValues.slice(0, maxCount).map((value) => {
                    const option = options.find((o) => o.value === value);
                    const IconComponent = option?.icon;
                    return (
                      <Badge
                        key={value}
                        className={cn(multiSelectVariants({ variant }))}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleOption(value);
                        }}
                      >
                        {IconComponent && (
                          <IconComponent className="h-4 w-4 mr-2" />
                        )}
                        {option?.label}
                      </Badge>
                    );
                  })}
                  <Separator orientation="vertical" />
                  {selectedValues.length > maxCount && (
                    <Badge
                      className={cn(
                        multiSelectVariants({ variant }),
                        "border-none hover:bg-transparent"
                      )}
                    >
                      {`+ ${selectedValues.length - maxCount} more`}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <XIcon
                    className="h-4 mx-2 cursor-pointer text-muted-foreground"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleClear();
                    }}
                  />
                  <Separator
                    orientation="vertical"
                    className="flex min-h-6 h-full"
                  />
                  {isPopoverOpen ? (
                    <ChevronUp className="h-4 mx-2 cursor-pointer text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 mx-2 cursor-pointer text-muted-foreground" />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full mx-auto">
                <span className="text-sm text-muted-foreground mx-3">
                  {placeholder}
                </span>
                <ChevronDown className="h-4 cursor-pointer text-muted-foreground mx-2" />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto min-w-[175px] p-0"
          align="start"
          onEscapeKeyDown={() => setIsPopoverOpen(false)}
        >
          <div>
            <ScrollArea className="max-h-[200px]" isHidden>
              <div className="flex flex-col">
                {options.map((option, index) => {
                  const isSelected = selectedValues.includes(option.value);

                  return (
                    <Button
                      key={option.value}
                      variant={isSelected ? "secondary" : "outline"}
                      className={cn(
                        "border-none rounded-none flex-1 justify-start hover:bg-selected",
                        index == 0 && "rounded-t-md",
                        index == 0 && "border border-b-2 border-green-500"
                      )}
                      onClick={() => toggleOption(option.value)}
                    >
                      <span>{option.label}</span>
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
            <Separator />
            <div className="flex items-center justify-between">
              {selectedValues.length > 0 && (
                <>
                  <Button
                    onClick={handleClear}
                    variant="outline"
                    className="border-none rounded-none rounded-bl-md flex-1"
                  >
                    Clear
                  </Button>
                  <Separator
                    orientation="vertical"
                    className="flex min-h-6 h-full"
                  />
                </>
              )}
              <Button
                onClick={() => setIsPopoverOpen(false)}
                variant="outline"
                className={cn(
                  "border-none rounded-none rounded-br-md flex-1",
                  selectedValues.length <= 0 && "rounded-bl-md"
                )}
              >
                Close
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);

MultiSelect.displayName = "MultiSelect";
