import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import createFetchMock from 'vitest-fetch-mock';
import { vi, afterEach } from 'vitest';

// Tell React we're in a test environment to properly handle act() warnings
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

// Global afterEach to handle cleanup with error catching
// This prevents React 18 "Should not already be working" errors from failing tests
afterEach(() => {
  try {
    cleanup();
  } catch (error) {
    // Ignore cleanup errors - they're usually React 18 concurrent mode issues
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes('Should not already be working')) {
      throw error; // Re-throw if it's not the expected error
    }
  }
});

const fetchMock = createFetchMock(vi);
fetchMock.enableMocks();

// Make fetchMock globally available for tests
globalThis.fetchMock = fetchMock;

// Suppress React 18 concurrent mode errors during cleanup
// These occur when React is still processing work when tests end
// "Should not already be working" is a known issue with React 18 + jsdom cleanup
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  const message = args[0];
  if (
    typeof message === 'string' &&
    (message.includes('Should not already be working') ||
      message.includes("Cannot read properties of undefined (reading 'stack')"))
  ) {
    return; // Suppress these specific errors
  }
  originalConsoleError.apply(console, args);
};

// Handle unhandled errors during cleanup
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (
      event.message?.includes('Should not already be working') ||
      event.error?.message?.includes('Should not already be working')
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

// Fixes test errors thrown by plotly.js dependency
window.URL.createObjectURL = URL.createObjectURL ?? ((obj: Blob) => '');
// Fixes test errors thrown due to gtag integration
window.gtag = () => {
  /** */
};
