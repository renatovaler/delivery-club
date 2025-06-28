// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import 'whatwg-fetch';
import { TextEncoder, TextDecoder } from 'util';

// Mock do matchMedia para testes
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock do IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback, options) {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() { return [] }
};

// Mock do ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock do scrollTo
global.scrollTo = jest.fn();

// Mock do localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock do sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// TextEncoder/TextDecoder para Node.js
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock das variáveis de ambiente
process.env = {
  ...process.env,
  NEXT_PUBLIC_API_BASE_URL: 'http://localhost:8000/api',
  NODE_ENV: 'test',
};

// Limpar todos os mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
});

// Silenciar warnings do console durante os testes
const originalError = console.error;
const originalWarn = console.warn;
const originalLog = console.log;

beforeAll(() => {
  console.error = (...args) => {
    if (
      /Warning/.test(args[0]) ||
      /Not implemented/.test(args[0]) ||
      /Invalid prop/.test(args[0])
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
    if (/Warning/.test(args[0])) {
      return;
    }
    originalWarn.call(console, ...args);
  };

  console.log = (...args) => {
    if (/Warning/.test(args[0])) {
      return;
    }
    originalLog.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
  console.log = originalLog;
});

// Mock do Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: {},
      asPath: '',
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock do Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock do Next.js image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));
