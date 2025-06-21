/**
 * Performance monitoring utility for visualizations
 */

export interface PerformanceMetrics {
  renderTime: number;
  fps: number;
  memoryUsage?: number;
  nodeCount?: number;
  edgeCount?: number;
}

export class PerformanceMonitor {
  private startTime: number = 0;
  private frameCount: number = 0;
  private lastFrameTime: number = 0;
  private fpsHistory: number[] = [];
  private maxHistorySize: number = 60;

  startMeasure(label: string) {
    this.startTime = performance.now();
    if (performance.mark) {
      performance.mark(`${label}-start`);
    }
  }

  endMeasure(label: string): number {
    const endTime = performance.now();
    const duration = endTime - this.startTime;
    
    if (performance.mark && performance.measure) {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);
    }
    
    return duration;
  }

  measureFPS(): number {
    const currentTime = performance.now();
    
    if (this.lastFrameTime !== 0) {
      const deltaTime = currentTime - this.lastFrameTime;
      const fps = 1000 / deltaTime;
      
      this.fpsHistory.push(fps);
      if (this.fpsHistory.length > this.maxHistorySize) {
        this.fpsHistory.shift();
      }
    }
    
    this.lastFrameTime = currentTime;
    this.frameCount++;
    
    // Calculate average FPS
    const avgFps = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
    return Math.round(avgFps);
  }

  getMemoryUsage(): number | undefined {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return Math.round(memory.usedJSHeapSize / 1048576); // Convert to MB
    }
    return undefined;
  }

  logMetrics(metrics: PerformanceMetrics) {
    console.group('Performance Metrics');
    console.log(`Render Time: ${metrics.renderTime.toFixed(2)}ms`);
    console.log(`FPS: ${metrics.fps}`);
    
    if (metrics.memoryUsage !== undefined) {
      console.log(`Memory Usage: ${metrics.memoryUsage}MB`);
    }
    
    if (metrics.nodeCount !== undefined) {
      console.log(`Node Count: ${metrics.nodeCount}`);
    }
    
    if (metrics.edgeCount !== undefined) {
      console.log(`Edge Count: ${metrics.edgeCount}`);
    }
    
    console.groupEnd();
  }

  reset() {
    this.frameCount = 0;
    this.fpsHistory = [];
    this.lastFrameTime = 0;
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
import { useEffect, useRef } from 'react';

export function usePerformanceMonitor(enabled: boolean = false) {
  const monitor = useRef(new PerformanceMonitor());
  const rafId = useRef<number>();

  useEffect(() => {
    if (!enabled) return;

    const measureFrame = () => {
      monitor.current.measureFPS();
      rafId.current = requestAnimationFrame(measureFrame);
    };

    measureFrame();

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      monitor.current.reset();
    };
  }, [enabled]);

  return monitor.current;
}

// Debounce utility for expensive operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility for frequent updates
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Virtual scrolling utility for large lists
export interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export function calculateVisibleRange(
  scrollTop: number,
  totalItems: number,
  options: VirtualScrollOptions
): { start: number; end: number } {
  const { itemHeight, containerHeight, overscan = 3 } = options;
  
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const end = Math.min(totalItems, start + visibleCount + overscan * 2);
  
  return { start, end };
}