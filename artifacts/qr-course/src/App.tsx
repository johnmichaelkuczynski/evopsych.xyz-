import { useEffect, useRef, type ComponentType } from "react";
import {
  ClerkProvider,
  SignIn,
  SignUp,
  Show,
} from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import {
  Switch,
  Route,
  Redirect,
  useLocation,
  Router as WouterRouter,
} from "wouter";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { useClerk } from "@clerk/react";
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

// REQUIRED — copy verbatim. Resolves the key from window.location.hostname so the
// same build serves multiple Clerk custom domains.
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

// REQUIRED — empty in dev (Clerk hits dev FAPI directly), auto-set in prod.
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

// Clerk passes full paths to routerPush/routerReplace, but wouter's setLocation
// prepends the base — strip it to avoid doubling.
function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
    socialButtonsPlacement: "top" as const,
    socialButtonsVariant: "blockButton" as const,
  },
  variables: {
    colorPrimary: "#1b294b",
    colorForeground: "#0f172a",
    colorMutedForeground: "#64748b",
    colorDanger: "#dc2626",
    colorBackground: "#ffffff",
    colorInput: "#ffffff",
    colorInputForeground: "#0f172a",
    colorNeutral: "#1b294b",
    fontFamily: "'Inter', sans-serif",
    borderRadius: "0.375rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-2xl w-[420px] max-w-full overflow-hidden shadow-xl border border-slate-200",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-slate-900 font-serif",
    headerSubtitle: "text-slate-500",
    socialButtonsBlockButton: "border border-slate-200 hover:bg-slate-50",
    socialButtonsBlockButtonText: "text-slate-700 font-medium",
    dividerLine: "bg-slate-200",
    dividerText: "text-slate-400",
    formFieldLabel: "text-slate-700",
    formFieldInput: "border border-slate-200 text-slate-900",
    formButtonPrimary: "bg-[#1b294b] hover:bg-[#16213d] text-white",
    footerActionText: "text-slate-500",
    footerActionLink: "text-[#1b294b] font-medium hover:underline",
    identityPreviewEditButton: "text-[#1b294b]",
    formFieldSuccessText: "text-emerald-600",
    formFieldErrorText: "text-red-600",
    alertText: "text-slate-700",
    otpCodeFieldInput: "border border-slate-200 text-slate-900",
    logoBox: "justify-center",
    logoImage: "h-10",
    main: "gap-5",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
      />
    </div>
  );
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <Home />
      </Show>
    </>
  );
}

// Wrap a page component so signed-out visitors are bounced to the landing page.
// Defined at module scope so each wrapper has a stable identity (no remounts).
function requireAuth<P extends object>(
  Component: ComponentType<P>,
): ComponentType<P> {
  return function Protected(props: P) {
    return (
      <>
        <Show when="signed-in">
          <Component {...props} />
        </Show>
        <Show when="signed-out">
          <Redirect to="/" />
        </Show>
      </>
    );
  };
}

const ProtectedDashboard = requireAuth(Dashboard);
const ProtectedAssignments = requireAuth(Assignments);
const ProtectedPractice = requireAuth(Practice);
const ProtectedAssignmentRunner = requireAuth(AssignmentRunner);
const ProtectedPracticeHub = requireAuth(PracticeHub);
const ProtectedPracticeAssignmentRunner = requireAuth(PracticeAssignmentRunner);
const ProtectedAnalytics = requireAuth(Analytics);
const ProtectedDiagnostics = requireAuth(Diagnostics);
const ProtectedWeekView = requireAuth(WeekView);
const ProtectedLectureView = requireAuth(LectureView);
const ProtectedTopicPractice = requireAuth(TopicPractice);

// Clears the query cache when the signed-in user changes, so one account never
// sees another's cached data.
function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route path="/dashboard" component={ProtectedDashboard} />
      <Route path="/assignments" component={ProtectedAssignments} />
      <Route path="/practice" component={ProtectedPractice} />
      <Route path="/assignments/:assignmentId/practice" component={ProtectedPracticeHub} />
      <Route path="/assignments/:id" component={ProtectedAssignmentRunner} />
      <Route path="/practice-assignments/:id" component={ProtectedPracticeAssignmentRunner} />
      <Route path="/analytics" component={ProtectedAnalytics} />
      <Route path="/diagnostics" component={ProtectedDiagnostics} />
      <Route path="/weeks/:weekNumber" component={ProtectedWeekView} />
      <Route path="/lectures/:lectureId" component={ProtectedLectureView} />
      <Route path="/practice/topic/:topicId" component={ProtectedTopicPractice} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to continue your course",
          },
        },
        signUp: {
          start: {
            title: "Create your account",
            subtitle: "Start teaching yourself evolutionary psychology",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
