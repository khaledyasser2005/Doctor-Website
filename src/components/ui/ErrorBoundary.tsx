import React, { Component, ErrorInfo } from 'react';
import { Button } from './Button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught UI error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F6F7F5] dark:bg-[#080A0D] p-6">
          <div className="max-w-md w-full rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#10141A] p-8 text-center space-y-4">
            <h1 className="text-xl font-bold text-[#0F1419] dark:text-[#F5F7FA]">
              Something unexpected happened
            </h1>
            <p className="text-sm text-[#5B6470] dark:text-[#9DA5B0]">
              Please reload the page to restore your session safely.
            </p>
            <Button onClick={() => window.location.reload()}>Reload Page</Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
