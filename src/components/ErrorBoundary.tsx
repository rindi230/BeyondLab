import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    private handleRetry = () => {
        this.setState({ hasError: false });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="flex flex-col items-center justify-center p-8 bg-black/40 backdrop-blur-md rounded-2xl border border-red-500/20 text-center space-y-4">
                    <div className="p-3 bg-red-500/10 rounded-full">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-white">Oops! Render Error</h3>
                        <p className="text-sm text-white/60 max-w-xs">
                            Mund të jetë një problem me memorjen e grafikës (WebGL). Provojeni përsëri.
                        </p>
                    </div>
                    <Button
                        onClick={this.handleRetry}
                        variant="outline"
                        className="gap-2 border-white/10 hover:bg-white/5"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Retry Simulation
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
