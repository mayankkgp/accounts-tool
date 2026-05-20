import React from "react";
import * as RadixSelect from "@radix-ui/react-select";

export const Select = RadixSelect.Root;
export const SelectGroup = RadixSelect.Group;
export const SelectValue = RadixSelect.Value;

export const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <RadixSelect.Trigger
    ref={ref}
    className={`flex items-center justify-between outline-none ${className || ""}`}
    {...props}
  >
    {children}
  </RadixSelect.Trigger>
));
SelectTrigger.displayName = "SelectTrigger";

export const SelectIcon = RadixSelect.Icon;
export const SelectPortal = RadixSelect.Portal;

export const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => (
  <RadixSelect.Content
    ref={ref}
    className={`z-50 overflow-hidden ${className || ""}`}
    position={position}
    {...props}
  >
    {children}
  </RadixSelect.Content>
));
SelectContent.displayName = "SelectContent";

export const SelectViewport = RadixSelect.Viewport;

export const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <RadixSelect.Item
    ref={ref}
    className={`flex items-center select-none outline-none ${className || ""}`}
    {...props}
  >
    {children}
  </RadixSelect.Item>
));
SelectItem.displayName = "SelectItem";

export const SelectItemText = RadixSelect.ItemText;
export const SelectItemIndicator = RadixSelect.ItemIndicator;
export const SelectLabel = RadixSelect.Label;
export const SelectSeparator = RadixSelect.Separator;

const SelectComponent = {
  Root: Select,
  Group: SelectGroup,
  Value: SelectValue,
  Trigger: SelectTrigger,
  Icon: SelectIcon,
  Portal: SelectPortal,
  Content: SelectContent,
  Viewport: SelectViewport,
  Item: SelectItem,
  ItemText: SelectItemText,
  ItemIndicator: SelectItemIndicator,
  Label: SelectLabel,
  Separator: SelectSeparator,
};

export default SelectComponent;
