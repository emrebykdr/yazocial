import React from 'react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('ErrorBoundary:', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-background flex items-center justify-center p-4">
                    <div className="bg-surface border border-danger/30 rounded-2xl p-10 text-center max-w-md space-y-4">
                        <div className="text-4xl">⚠</div>
                        <h1 className="text-xl font-black text-textPrimary">Bir şeyler ters gitti</h1>
                        <p className="text-sm text-textSecondary">{this.state.error?.message || 'Beklenmedik bir hata oluştu.'}</p>
                        <button
                            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
                            className="mt-4 px-6 py-2 bg-primary hover:bg-primaryHover text-white rounded-xl text-sm font-bold transition-colors"
                        >
                            Sayfayı Yenile
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
