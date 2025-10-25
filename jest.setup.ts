// Jest全局设置文件
import '@testing-library/jest-dom';

// 模拟全局对象
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
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



// 模拟document对象属性
document.createRange = () => ({
  setStart: jest.fn(),
  setEnd: jest.fn(),
  commonAncestorContainer: {
    nodeName: 'BODY',
    textContent: '',
    ownerDocument: document,
    nodeType: 1,
    appendChild: jest.fn(),
    removeChild: jest.fn(),
    insertBefore: jest.fn(),
    hasChildNodes: jest.fn(),
    cloneNode: jest.fn(),
    baseURI: '',
    childNodes: { length: 0 },
    firstChild: null,
    isConnected: true,
    getAttribute: jest.fn(),
    setAttribute: jest.fn()
  },
  cloneContents: jest.fn(),
  cloneRange: jest.fn(),
  collapse: jest.fn(),
  compareBoundaryPoints: jest.fn(),
  deleteContents: jest.fn(),
  extractContents: jest.fn(),
  insertNode: jest.fn(),
  selectNode: jest.fn(),
  selectNodeContents: jest.fn(),
  toString: jest.fn(),
  setStartBefore: jest.fn(),
  setStartAfter: jest.fn(),
  setEndBefore: jest.fn(),
  setEndAfter: jest.fn(),
} as unknown as Range);

// 模拟localStorage和sessionStorage
const mockLocalStorage = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

const mockSessionStorage = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });

// 全局错误处理
console.error = jest.fn();
console.warn = jest.fn();

// 配置测试覆盖率阈值
// 使用Object.defineProperty来设置环境变量
Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', writable: true });

// 定义Request选项接口
interface RequestOptions {
  method?: string;
  headers?: HeadersInit;
  body?: unknown;
  // 使用具体的属性而不是索引签名
  cache?: RequestCache;
  credentials?: RequestCredentials;
  mode?: RequestMode;
  redirect?: RequestRedirect;
  referrer?: string;
  referrerPolicy?: ReferrerPolicy;
}

// 全局模拟Request对象，用于Next.js API测试
global.Request = jest.fn().mockImplementation((url: string, options: RequestOptions = {}) => ({
  url,
  method: options.method || 'GET',
  headers: options.headers || new Headers(),
  nextUrl: {
    searchParams: new URLSearchParams()
  },
  json: jest.fn().mockResolvedValue({}),
  text: jest.fn().mockResolvedValue(''),
  formData: jest.fn().mockResolvedValue(new Map())
}));

// 定义Response选项接口
interface ResponseOptions {
  status?: number;
  statusText?: string;
  headers?: HeadersInit;
  // 具体属性而不是索引签名
  redirect?: RequestRedirect;
  type?: ResponseType;
}

// 定义模拟的Response构造函数和实例
interface MockResponseInstance {
  body: unknown;
  status: number;
  statusText: string;
  headers: Headers;
  ok: boolean;
  json: jest.Mock<Promise<unknown>>;
  text: jest.Mock<Promise<string>>;
  clone: () => MockResponseInstance;
}

interface MockResponseConstructor {
  new(body?: unknown, options?: ResponseOptions): MockResponseInstance;
  error: () => MockResponseInstance;
  json: (data: unknown, init?: ResponseOptions) => MockResponseInstance;
  redirect: (url: string | URL, status?: number) => MockResponseInstance;
  mockImplementation: (fn: (...args: unknown[]) => unknown) => MockResponseConstructor;
}

// 创建带有类型断言的MockResponse
const MockResponse = jest.fn() as unknown as MockResponseConstructor;
// 使用正确的参数类型
MockResponse.mockImplementation((...args: unknown[]) => {
  const [body, options = {}] = args;
  const typedOptions = options as ResponseOptions;
  return {
    body: body,
    status: typedOptions.status || 200,
    statusText: typedOptions.statusText || 'OK',
    headers: new Headers(typedOptions.headers || {}),
    ok: (typedOptions.status || 200) >= 200 && (typedOptions.status || 200) < 300,
    json: jest.fn().mockResolvedValue(body),
    text: jest.fn().mockResolvedValue(typeof body === 'string' ? body : JSON.stringify(body)),
    clone: function() { return this; },
  };
});

// 添加必要的静态方法
(MockResponse as MockResponseConstructor).error = jest.fn(() => ({
  body: null,
  status: 0,
  statusText: '',
  headers: new Headers(),
  ok: false,
  json: jest.fn().mockResolvedValue(null),
  text: jest.fn().mockResolvedValue(''),
  clone: function() { return this; }
}));

(MockResponse as MockResponseConstructor).json = jest.fn((data: unknown, init?: ResponseOptions) => ({
  body: data,
  status: init?.status || 200,
  statusText: init?.statusText || 'OK',
  headers: new Headers(init?.headers || {}),
  ok: true,
  json: jest.fn().mockResolvedValue(data),
  text: jest.fn().mockResolvedValue(JSON.stringify(data)),
  clone: function() { return this; }
}));

(MockResponse as MockResponseConstructor).redirect = jest.fn((url: string | URL, status: number = 302) => ({
  body: null,
  url: String(url),
  status: status,
  statusText: 'Redirect',
  headers: new Headers({ Location: String(url) }),
  ok: false,
  json: jest.fn().mockResolvedValue({}),
  text: jest.fn().mockResolvedValue(''),
  clone: function() { return this; }
}));

// 使用类型断言来处理全局对象，避免any类型
// 使用unknown类型而不是any类型
Object.assign(global, {
  Response: MockResponse as unknown as typeof Response
});

// 定义NextResponse数据类型
type NextResponseData = Record<string, unknown> | Array<unknown> | string | number | boolean | null;

// 定义NextResponse选项接口
interface NextResponseOptions {
  status?: number;
  headers?: Record<string, string>;
}

// 全局模拟NextResponse对象
class MockNextResponse {
  public data: NextResponseData;
  public status: number;
  public headers: Record<string, string>;
  public ok: boolean;
  
  constructor(data: NextResponseData, options: NextResponseOptions = {}) {
    this.data = data;
    this.status = options.status || 200;
    this.headers = options.headers || {};
    this.ok = this.status >= 200 && this.status < 300;
  }
  
  async json(): Promise<NextResponseData> {
    return this.data;
  }
  
  async text(): Promise<string> {
    return JSON.stringify(this.data);
  }
}

// 定义NextResponse接口
interface NextResponseStatic {
  json: (data: NextResponseData, options?: NextResponseOptions) => MockNextResponse;
  redirect: (url: string | URL) => Response;
  rewrite: (url: string | URL) => Response;
}

// 使用类型断言修复全局对象赋值
const nextResponseImplementation: NextResponseStatic = {
  json: jest.fn().mockImplementation((data: NextResponseData, options?: NextResponseOptions) => {
    return new MockNextResponse(data, options);
  }),
  redirect: jest.fn(),
  rewrite: jest.fn()
};

// 使用Object.assign添加NextResponse到全局对象
Object.assign(global, {
  NextResponse: nextResponseImplementation
});

// 定义next/server模块接口
interface NextServerModule {
  server: {
    web: {
      specExtension: {
        response: {
          NextResponse: NextResponseStatic;
        };
      };
    };
  };
}

// 确保next/server模块的模拟
const nextServerImplementation: NextServerModule = {
  server: {
    web: {
      specExtension: {
        response: {
          NextResponse: nextResponseImplementation
        }
      }
    }
  }
};

// 使用Object.assign添加next到全局对象
Object.assign(global, {
  next: nextServerImplementation
});

// 全局模拟resilience-middleware模块
jest.mock('@/middleware/resilience-middleware', () => ({
  resilienceMiddleware: {
    wrap: jest.fn((handler: (...args: unknown[]) => unknown) => handler) // 直接返回handler，忽略options参数
  },
  getResilienceStatus: jest.fn(() => ({
    metrics: {},
    circuitBreakers: {}
  }))
}));