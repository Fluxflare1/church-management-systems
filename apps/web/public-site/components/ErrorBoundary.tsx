// apps/web/public-site/components/ErrorBoundary.tsx
'use client';
import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    // In production, consider reporting to external service (Sentry) — omitted per spec.
    // console.error(error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <div className="p-4 bg-red-50 text-red-700 rounded">Something went wrong loading this section.</div>;
    }
    return this.props.children;
  }
}
