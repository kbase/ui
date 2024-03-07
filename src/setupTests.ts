// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import 'jest-canvas-mock';

// Fixes test errors thrown by plotly.js dependency
window.URL.createObjectURL = URL.createObjectURL ?? ((obj: Blob) => '');
// Fixes test errors thrown due to gtag integration
window.gtag = () => {
  /** */
};
