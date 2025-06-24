import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Contest from "@/pages/contest";
import OpinionSelection from "@/pages/opinion-selection";
import Confirmation from "@/pages/confirmation";
import Leaderboard from "@/pages/leaderboard";
import Admin from "@/pages/admin";
import CMS from "@/pages/cms";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/contest" component={Contest} />
      <Route path="/opinion-selection" component={OpinionSelection} />
      <Route path="/confirmation" component={Confirmation} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/admin" component={Admin} />
      <Route path="/cms" component={CMS} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppWrapper() {
  const [location] = useLocation();
  const isCMSRoute = location === '/cms';
  
  return (
    <div className="w-full bg-white min-h-screen">
      <div 
        className={`${isCMSRoute ? 'w-full' : 'max-w-md mx-auto shadow-lg'} bg-white min-h-screen`}
      >
        <Router />
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppWrapper />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
