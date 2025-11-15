import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Landing from "@/pages/Landing";
import Collections from "@/pages/Collections";
import Resources from "@/pages/Resources";
import ResourceCategory from "@/pages/ResourceCategory";
import DesignEditor from "@/pages/DesignEditor";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/collections" component={Collections} />
      <Route path="/resources" component={Resources} />
      <Route path="/resources/:slug" component={ResourceCategory} />
      <Route path="/editor/:id" component={DesignEditor} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
