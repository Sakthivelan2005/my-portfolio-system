import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class WebGLErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render shows the fallback UI (or nothing)
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error silently. The user never sees the crash.
    console.error("WebGL crashed, but the site lives on:", error, "\n Reason: ",errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // Return null to completely hide the broken 3D component 
      // while keeping the rest of the website alive.
      return null; 
    }

    return this.props.children;
  }
}

export default WebGLErrorBoundary;