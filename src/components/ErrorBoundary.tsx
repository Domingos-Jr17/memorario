"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { TriangleAlert } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: _, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen flex flex-col items-center justify-center bg-red-50 px-4 py-12"
        >
          <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-red-200 text-center">
            <TriangleAlert className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-extrabold text-red-800 mb-4">Oops! Something went wrong.</h2>
            <p className="text-gray-700 mb-6">
              We&apos;re sorry, but an unexpected error occurred. Please try refreshing the page.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left p-4 bg-gray-100 rounded-md overflow-auto max-h-60">
                <summary className="font-semibold text-gray-800 cursor-pointer">Error Details</summary>
                <pre className="mt-2 text-sm text-gray-600 whitespace-pre-wrap break-all">
                  {this.state.error.toString()}
                  <br />
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-8 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition"
            >
              Refresh Page
            </button>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
