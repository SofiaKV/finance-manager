import '@testing-library/jest-dom';

// Polyfill for TextEncoder/TextDecoder (required for React Router DOM in Jest)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { TextEncoder, TextDecoder } = require('util');
Object.assign(globalThis, { TextEncoder, TextDecoder });
