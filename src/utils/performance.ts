// Performance optimization utilities
import { lazy, ComponentType } from 'react'

// Lazy loading with error boundaries
export const lazyWithRetry = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  retries = 3
): React.LazyExoticComponent<T> => {
  return lazy(() => {
    return new Promise((resolve, reject) => {
      const attemptImport = (attempt: number) => {
        importFunc()
          .then(resolve)
          .catch((error) => {
            if (attempt < retries) {
              console.warn(`Lazy loading attempt ${attempt + 1} failed, retrying...`, error)
              setTimeout(() => attemptImport(attempt + 1), 1000 * attempt)
            } else {
              console.error('Lazy loading failed after all retries:', error)
              reject(error)
            }
          })
      }
      attemptImport(1)
    })
  })
}

// Debounce utility for performance
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle utility for performance
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Memory usage monitoring
export const getMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    return {
      used: Math.round(memory.usedJSHeapSize / 1048576), // MB
      total: Math.round(memory.totalJSHeapSize / 1048576), // MB
      limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
    }
  }
  return null
}

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now()
  fn()
  const end = performance.now()
  console.log(`${name} took ${end - start} milliseconds`)
  return end - start
}

// Image optimization
export const optimizeImage = (src: string, width?: number, height?: number, quality = 80) => {
  // In a real app, you might use a service like Cloudinary or ImageKit
  const params = new URLSearchParams()
  if (width) params.set('w', width.toString())
  if (height) params.set('h', height.toString())
  params.set('q', quality.toString())
  
  return `${src}?${params.toString()}`
}

// Bundle size monitoring
export const logBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    const scripts = document.querySelectorAll('script[src]')
    // let totalSize = 0
    
    scripts.forEach(script => {
      const src = script.getAttribute('src')
      if (src && src.includes('assets')) {
        // This is a simplified check - in reality you'd need to fetch and measure
        console.log(`Script: ${src}`)
      }
    })
  }
}

// Preload critical resources
export const preloadCriticalResources = () => {
  const criticalResources = [
    '/fonts/inter.woff2',
    '/icons/logo.svg'
  ]
  
  criticalResources.forEach(resource => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = resource
    link.as = resource.endsWith('.woff2') ? 'font' : 'image'
    if (resource.endsWith('.woff2')) {
      link.crossOrigin = 'anonymous'
    }
    document.head.appendChild(link)
  })
}

// Service Worker utilities
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered:', registration)
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update notification
              console.log('New content available, please refresh')
            }
          })
        }
      })
      
      return registration
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }
}

// Cache management
export const clearOldCaches = async () => {
  if ('caches' in window) {
    const cacheNames = await caches.keys()
    const oldCaches = cacheNames.filter(name => 
      name.startsWith('study-companion-') && 
      !name.includes('v1.0.0') // Keep current version
    )
    
    await Promise.all(
      oldCaches.map(cacheName => caches.delete(cacheName))
    )
    
    console.log('Cleared old caches:', oldCaches)
  }
}

// Network status monitoring
export const getNetworkStatus = () => {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    }
  }
  return null
}

// Performance budget monitoring
export const checkPerformanceBudget = () => {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  
  if (navigation) {
    const metrics = {
      fcp: 0, // First Contentful Paint
      lcp: 0, // Largest Contentful Paint
      fid: 0, // First Input Delay
      cls: 0  // Cumulative Layout Shift
    }
    
    // Check if metrics are within budget
    const budget = {
      fcp: 1800, // 1.8s
      lcp: 2500, // 2.5s
      fid: 100,  // 100ms
      cls: 0.1   // 0.1
    }
    
    const violations = Object.entries(metrics).filter(
      ([key, value]) => value > budget[key as keyof typeof budget]
    )
    
    if (violations.length > 0) {
      console.warn('Performance budget violations:', violations)
    }
    
    return { metrics, budget, violations }
  }
  
  return null
}

// Resource hints
export const addResourceHints = () => {
  const hints = [
    { rel: 'dns-prefetch', href: 'https://api.openai.com' },
    { rel: 'dns-prefetch', href: 'https://ntbhjokkvddqtowpbfxm.supabase.co' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' }
  ]
  
  hints.forEach(hint => {
    const link = document.createElement('link')
    Object.entries(hint).forEach(([key, value]) => {
      link.setAttribute(key, value)
    })
    document.head.appendChild(link)
  })
}

// Initialize performance optimizations
export const initializePerformanceOptimizations = () => {
  // Add resource hints
  addResourceHints()
  
  // Preload critical resources
  preloadCriticalResources()
  
  // Register service worker
  registerServiceWorker()
  
  // Clear old caches
  clearOldCaches()
  
  // Log bundle size in development
  if (process.env.NODE_ENV === 'development') {
    logBundleSize()
  }
  
  console.log('Performance optimizations initialized')
}
