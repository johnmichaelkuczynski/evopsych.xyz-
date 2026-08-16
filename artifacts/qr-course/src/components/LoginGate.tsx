import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const LOGIN_REQUIRED_EVENT = "evo:login-required";

/** Detects the API's LOGIN_REQUIRED payload on any error object. */
export function isLoginRequiredError(error: unknown): boolean {
  const data = (error as { data?: { code?: string } } | null)?.data;
  return data?.code === "LOGIN_REQUIRED";
}

export function fireLoginRequired() {
  window.dispatchEvent(new CustomEvent(LOGIN_REQUIRED_EVENT));
}

// Modal shown when an anonymous visitor exhausts the free AI budget.
export function LoginGateDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(LOGIN_REQUIRED_EVENT, handler);
    return () => window.removeEventListener(LOGIN_REQUIRED_EVENT, handler);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">
            You've sampled the course — sign in to keep going
          </DialogTitle>
          <DialogDescription>
            You've used your free preview of the AI tutor, practice, and
            grading. Sign in with Google (it's free) to continue with
            unlimited access and saved progress.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 mt-2">
          <Link href="/sign-up" onClick={() => setOpen(false)}>
            <button className="w-full px-4 py-2.5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
              Sign in with Google
            </button>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="w-full px-4 py-2.5 rounded-md text-sm font-medium border border-border hover:bg-secondary transition-colors"
          >
            Keep browsing the lectures
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
