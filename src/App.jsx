import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, MotionConfig } from 'motion/react'
import { ToastProvider } from './components/Toast'
import Home from './pages/Home'

// Each tool loads on demand so the home page stays light
const CountdownTool = lazy(() => import('./tools/countdown/CountdownTool'))
const WishesTool = lazy(() => import('./tools/wishes/WishesTool'))
const InvitationTool = lazy(() => import('./tools/invitation/InvitationTool'))

function Loading() {
  return (
    <div className="grid min-h-[70dvh] place-items-center" role="status" aria-label="Loading">
      <span className="size-10 animate-spin rounded-full border-4 border-line border-t-coral" />
    </div>
  )
}

const TITLES = {
  '/': 'Birthday Studio · Countdown, Wishes & Invitations',
  '/countdown': 'Birthday Countdown Timer · Birthday Studio',
  '/wishes': 'Birthday Wishes Generator · Birthday Studio',
  '/invitation': 'Birthday Invitation Maker · Birthday Studio',
}

export default function App() {
  const location = useLocation()

  // Reset scroll and title when switching tools
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.title = TITLES[location.pathname] || TITLES['/']
  }, [location.pathname])

  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <Suspense fallback={<Loading />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/countdown" element={<CountdownTool />} />
              <Route path="/wishes" element={<WishesTool />} />
              <Route path="/invitation" element={<InvitationTool />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </ToastProvider>
    </MotionConfig>
  )
}
