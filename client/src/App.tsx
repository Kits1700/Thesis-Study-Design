import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import StudyPage from "@/pages/study";
import AdminPage from "@/pages/admin";
import ResponsesPage from "@/pages/responses";
import SimpleAdminPage from "@/pages/simple-admin";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={StudyPage} />
      <Route path="/study" component={StudyPage} />
      <Route path="/admin" component={SimpleAdminPage} />
      <Route path="/responses" component={ResponsesPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <div className="dark">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
