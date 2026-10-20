import { Component, lazy, Suspense } from 'react'

// The whole three.js / R3F stack lives in its own chunk and loads after first paint.
const HeroScene = lazy(() => import('./HeroScene'))

class SceneBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error) {
    console.warn('[3D scene disabled]', error?.message || error)
    this.props.onFail?.()
  }
  render() { return this.state.failed ? null : this.props.children }
}

/** Fixed full-viewport layer behind the page content. Decorative, so hidden from assistive tech. */
export default function SceneRoot({ theme, mode, reduced, onStatus }) {
  return (
    <div className="scene-layer" aria-hidden="true">
      <SceneBoundary onFail={() => onStatus('fallback')}>
        <Suspense fallback={null}>
          <HeroScene
            theme={theme}
            mode={mode}
            reduced={reduced}
            onReady={() => onStatus('ready')}
            onError={() => onStatus('fallback')}
          />
        </Suspense>
      </SceneBoundary>
    </div>
  )
}
