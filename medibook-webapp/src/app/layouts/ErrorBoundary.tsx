import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  fallback: (error: unknown, reset: () => void) => ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  err: unknown;
}

/**
 * Per-view error boundary, ported from the design prototype
 * (`Medibook mbAdmin.html` `ErrorBoundary`). This is a class component by
 * necessity — React only exposes error-boundary behaviour through class
 * lifecycles (`getDerivedStateFromError`) — a pre-authorized exception to
 * the function-components-only rule.
 *
 * The prototype's `resetKey` prop is expressed as a React `key={view}` at
 * the call sites instead: a view change remounts the boundary, clearing any
 * caught error exactly like the prototype's `componentDidUpdate` reset.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { err: null };

  static getDerivedStateFromError(err: unknown): ErrorBoundaryState {
    return { err };
  }

  render(): ReactNode {
    if (this.state.err)
      return this.props.fallback(this.state.err, () => this.setState({ err: null }));
    return this.props.children;
  }
}
