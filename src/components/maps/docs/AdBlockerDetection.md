# Ad Blocker Detection for Google Maps

This document describes how ad blocker detection works in our map components and how to use it in your application.

## Overview

Ad blockers can prevent Google Maps from loading properly by blocking access to Google's domains. Our application includes comprehensive ad blocker detection that:

1. Uses multiple detection methods for higher accuracy
2. Provides user-friendly warning messages
3. Offers consistent handling across all map components
4. Allows users to dismiss warnings or try loading the map anyway

## How It Works

The detection system uses four primary methods:

1. **Ad-like Element Test**: Creates a hidden element that mimics ad content to see if it gets hidden by ad blockers
2. **Google Analytics Access Test**: Checks if access to Google Analytics is blocked (often correlated with Google Maps blocking)
3. **Google Maps API Domain Test**: Checks if the Maps API domain is accessible
4. **Script Element Test**: Tests if script tags loading from Google domains are blocked

## Using Ad Blocker Detection

### In Custom Components

To add ad blocker detection to your custom components:

```tsx
import { useAdBlockerDetection } from '../components/maps/hooks/useAdBlockerDetection';
import AdBlockerWarning from '../components/maps/components/AdBlockerWarning';

const MyMapComponent = () => {
  const isAdBlocked = useAdBlockerDetection();
  const [adBlockerDismissed, setAdBlockerDismissed] = useState(false);
  
  // Only show warning if ad blocker detected and not dismissed
  const showWarning = isAdBlocked && !adBlockerDismissed;
  
  const handleDismiss = () => {
    setAdBlockerDismissed(true);
  };
  
  return (
    <div>
      {showWarning && (
        <AdBlockerWarning 
          onDismiss={handleDismiss}
          onTryAnyway={handleDismiss}
          compact={false} // Set to true for a smaller warning
        />
      )}
      
      {/* Your map component */}
    </div>
  );
};
```

### Available Components

#### useAdBlockerDetection Hook

```tsx
const isAdBlocked = useAdBlockerDetection();
```

Returns a boolean indicating whether an ad blocker was detected.

#### AdBlockerWarning Component

```tsx
<AdBlockerWarning 
  compact={boolean}        // Optional: Display compact version (default: false)
  onDismiss={() => {}}     // Optional: Handler when user dismisses warning
  onTryAnyway={() => {}}   // Optional: Handler when user wants to try anyway
/>
```

## Troubleshooting

If detection doesn't work correctly:

1. **False Positives**: Some privacy extensions might trigger detection without actually blocking Maps
2. **False Negatives**: Some sophisticated ad blockers might evade detection
3. **Manual Testing**: You can test if Maps loads by checking if `window.google?.maps` is defined

## Implementation Details

The detection logic attempts to balance between:

- **Accuracy**: Using multiple detection methods to reduce false positives/negatives
- **Performance**: Minimizing impact on page load time
- **User Experience**: Providing helpful messaging without being intrusive

## Customizing Warnings

The `AdBlockerWarning` component accepts custom styling through standard props. You can also create your own warning component using the detection hook.

```tsx
// Custom warning with different styling
<AdBlockerWarning 
  compact={true} 
  onDismiss={handleDismiss}
  // Additional styling props from Chakra UI
  borderRadius="lg"
  boxShadow="xl"
/>
``` 