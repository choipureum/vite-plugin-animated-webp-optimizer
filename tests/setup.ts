// Mock console methods to avoid noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Suppress console output during tests unless explicitly needed
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  // Restore console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Mock fs module for file operations
jest.mock("fs", () => ({
  ...jest.requireActual("fs"),
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
  statSync: jest.fn(),
  readFileSync: jest.fn(),
  copyFileSync: jest.fn(),
}));

// Mock path module
jest.mock("path", () => ({
  ...jest.requireActual("path"),
  resolve: jest.fn(),
  join: jest.fn(),
  basename: jest.fn(),
}));

// Mock sharp module
jest.mock("sharp", () => {
  const mockSharp = jest.fn();
  mockSharp.mockReturnValue({
    metadata: jest.fn(),
    webp: jest.fn().mockReturnValue({
      toFile: jest.fn(),
    }),
    resize: jest.fn().mockReturnValue({
      webp: jest.fn().mockReturnValue({
        toFile: jest.fn(),
      }),
    }),
  });
  return mockSharp;
});
