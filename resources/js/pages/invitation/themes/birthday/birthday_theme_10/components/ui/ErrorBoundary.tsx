import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback: ReactNode;
    onError?: (error: unknown) => void;
}

interface State {
    failed: boolean;
}

/** Catches renderer failures (e.g. WebGL context creation) so the invitation keeps working. */
export class ErrorBoundary extends Component<Props, State> {
    state: State = { failed: false };

    static getDerivedStateFromError(): State {
        return { failed: true };
    }

    componentDidCatch(error: unknown, info: ErrorInfo) {
        console.warn('[ToyWorld] 3D scene disabled:', error, info.componentStack);
        this.props.onError?.(error);
    }

    render() {
        return this.state.failed ? this.props.fallback : this.props.children;
    }
}
