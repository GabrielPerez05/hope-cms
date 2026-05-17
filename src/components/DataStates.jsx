import { Component } from "react";

export class DataErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <DataErrorState
          message={
            this.state.error.message || "Something went wrong while loading data."
          }
        />
      );
    }

    return this.props.children;
  }
}

export function DataLoadingState({ label = "Loading data..." }) {
  return (
    <div className="rounded-[2rem] border border-emerald-100 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-700" />
      <p className="mt-4 text-sm font-semibold text-slate-700">{label}</p>
    </div>
  );
}

export function DataErrorState({
  message = "Unable to load data.",
  title = "Data unavailable",
}) {
  return (
    <div className="rounded-[2rem] border border-rose-100 bg-rose-50 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-rose-900">{title}</h2>
      <p className="mt-2 text-sm text-rose-700">{message}</p>
    </div>
  );
}
