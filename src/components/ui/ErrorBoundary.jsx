import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI error:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface text-on-surface flex items-center justify-center px-6">
          <section className="max-w-xl w-full bg-surface-container-low rounded-xl p-8 shadow-botanical">
            <p className="label-caps text-primary mb-2">Application Error</p>
            <h1 className="text-2xl font-extrabold tracking-tight mb-3">Something went wrong in the dashboard.</h1>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Please reload the page. If this keeps happening, check browser console logs and API key configuration.
            </p>
            <button
              onClick={this.handleReload}
              className="mt-6 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-extrabold uppercase tracking-widest hover:bg-primary-container transition-colors"
            >
              Reload App
            </button>
          </section>
        </div>
      )
    }

    return this.props.children
  }
}
