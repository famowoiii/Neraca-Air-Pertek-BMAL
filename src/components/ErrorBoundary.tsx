import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : String(error);
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false, message: '' });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4 max-w-md p-8">
          <AlertTriangle size={48} className="mx-auto text-red-400" />
          <h1 className="text-lg font-semibold text-gray-800">Terjadi Kesalahan</h1>
          <p className="text-sm text-gray-500">
            Aplikasi mengalami error yang tidak terduga. Silakan muat ulang halaman.
          </p>
          {this.state.message && (
            <pre className="text-xs text-left bg-gray-100 rounded p-3 text-red-600 overflow-auto max-h-32">
              {this.state.message}
            </pre>
          )}
          <button
            onClick={this.handleReload}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }
}
