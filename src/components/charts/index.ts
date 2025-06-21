/**
 * Chart components with lazy loading support
 */

import { lazy } from 'react';

// Lazy load chart components for better performance
export const ThemeFrequencyChart = lazy(() => import('./ThemeFrequencyChart'));

// Future chart components can be added here:
// export const SentimentChart = lazy(() => import('./SentimentChart'));
// export const TimelineChart = lazy(() => import('./TimelineChart'));
// export const NetworkGraph = lazy(() => import('./NetworkGraph'));