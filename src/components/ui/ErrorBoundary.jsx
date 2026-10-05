import { Component } from "react";
import ErrorState from "./ErrorState";
export default class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    return this.state.error ? (
      <main>
        <h1 className="text-h1">SignMate</h1>
        <ErrorState error={{ message: "Trang gặp sự cố. Thử tải lại để tiếp tục." }} />
      </main>
    ) : (
      this.props.children
    );
  }
}
