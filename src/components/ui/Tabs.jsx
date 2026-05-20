import React from "react";
import * as RadixTabs from "@radix-ui/react-tabs";

export const Tabs = RadixTabs.Root;

export const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <RadixTabs.List
    ref={ref}
    className={`flex ${className || ""}`}
    {...props}
  />
));
TabsList.displayName = "TabsList";

export const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <RadixTabs.Trigger
    ref={ref}
    className={`focus-visible:outline-none select-none transition-all ${className || ""}`}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <RadixTabs.Content
    ref={ref}
    className={`focus-visible:outline-none ${className || ""}`}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";

const TabsComponent = {
  Root: Tabs,
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
};

export default TabsComponent;
