"use client";

/**
 * ThemeErrorBoundary
 *
 * React error boundary that catches render errors thrown by theme components
 * (layout.tsx, templates, blocks). Shows a safe fallback UI so the whole
 * page does not go blank when a theme component crashes.
 *
 * Production Hardening Checklist item: "Error boundary for broken themes"
 *
 * Usage:
 *   import ThemeErrorBoundary from "@/components/ThemeErrorBoundary";
 *
 *   <ThemeErrorBoundary themeName={activeTheme}>
 *     <Layout theme={theme}>{children}</Layout>
 *   </ThemeErrorBoundary>
 */
import { Component, type ReactNode } from "react";

interface Props {
  children:  ReactNode;
  /** Active theme name — included in the error log for diagnostics. */
  themeName?: string;
}

interface State {
  hasError: boolean;
  error?:   Error;
}

export default class ThemeErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    // Extend this to call your monitoring SDK (Sentry.captureException, etc.)
    console.error(
      "[theme-engine] | theme=" + (this.props.themeName ?? "unknown") +
      " | op=render | " + error.message,
      info.componentStack,
    );
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <h1 className="text-2xl font-bold text-slate-800">Theme Error</h1>
          <p className="text-slate-500 text-sm">
            The active theme encountered a render error. Please contact your
            site administrator or switch to a different theme.
          </p>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <pre className="text-xs text-left bg-slate-100 rounded-lg p-4 text-red-600 overflow-auto">
              {this.state.error.message}
            </pre>
          )}
          <a
            href="/"
            className="inline-block mt-2 px-5 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700 transition-colors"
          >
            Return to home
          </a>
        </div>
      </div>
    );
  }
}
