import { useEffect } from "react";
import {
  Switch,
  Route,
  useLocation,
  Router as WouterRouter,
} from "wouter";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Assignments from "@/pages/Assignments";
import Practice from "@/pages/Practice";
import Analytics from "@/pages/Analytics";
import WeekView from "@/pages/WeekView";
import LectureView from "@/pages/LectureView";
import AssignmentRunner from "@/pages/AssignmentRunner";
import PracticeHub from "@/pages/PracticeHub";
import PracticeAssignmentRunner from "@/pages/PracticeAssignmentRunner";
import Diagnostics from "@/pages/Diagnostics";
import TopicPractice from "@/pages/TopicPractice";

const queryClient = new QueryClient();

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

// Records one unique-visitor ping per app load (anonymous cookie-based).
function VisitorTracker() {
  useEffect(() => {
    fetch("/api/visitors/track", { method: "POST" }).catch(() => {});
  }, []);
  return null;
}

const PAGE_TITLES: [prefix: string, title: string][] = [
  ["/dashboard", "Dashboard — Evolutionary Psychology Course"],
  ["/assignments", "Assignments — Evolutionary Psychology Course"],
  ["/practice", "Practice — Evolutionary Psychology Course"],
  ["/analytics", "Analytics — Evolutionary Psychology Course"],
  ["/weeks/", "Weekly Lectures — Evolutionary Psychology Course"],
  ["/lectures/", "Lecture — Evolutionary Psychology Course"],
];

// Keeps document.title in sync with the route for search engines and tabs.
function PageTitle() {
  const [location] = useLocation();
  useEffect(() => {
    const match = PAGE_TITLES.find(([prefix]) => location.startsWith(prefix));
    document.title =
      match?.[1] ??
      "Evolutionary Psychology — Free AI-Powered Online Course";
  }, [location]);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/assignments" component={Assignments} />
      <Route path="/practice" component={Practice} />
      <Route path="/assignments/:assignmentId/practice" component={PracticeHub} />
      <Route path="/assignments/:id" component={AssignmentRunner} />
      <Route path="/practice-assignments/:id" component={PracticeAssignmentRunner} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/diagnostics" component={Diagnostics} />
      <Route path="/weeks/:weekNumber" component={WeekView} />
      <Route path="/lectures/:lectureId" component={LectureView} />
      <Route path="/practice/topic/:topicId" component={TopicPractice} />
      <Route component={NotFound} />
    </Switch>
  );
}

function CourseApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <VisitorTracker />
      <PageTitle />
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <CourseApp />
    </WouterRouter>
  );
}

export default App;
