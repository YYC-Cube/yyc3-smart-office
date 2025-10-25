'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// 暂时移除未使用的Select组件导入
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Code2, PlayCircle, CheckCircle2, AlertTriangle, AlertCircle, FileCode, Database, Shield, 
  BarChart3, Layout, RefreshCw, Zap, FileDown, Copy, Settings, HelpCircle
} from 'lucide-react';

// 测试类型定义
type TestType = 'unit' | 'integration' | 'e2e' | 'api';

// 测试模板类型
type TestTemplate = {
  id: string;
  name: string;
  type: TestType;
  description: string;
  codeSnippet: string;
};

// 测试生成配置
type TestConfig = {
  componentPath: string;
  componentName: string;
  testType: TestType;
  includeProps: boolean;
  includeState: boolean;
  includeEvents: boolean;
  mockExternal: boolean;
  customImports: string;
  customSetup: string;
  customTests: string;
};

// 生成的测试结果
type TestResult = {
  id: string;
  status: 'pending' | 'pass' | 'fail' | 'error';
  name: string;
  duration: number | null;
  errorMessage?: string;
};

export function IntelligentTestGenerator() {
  // 状态管理
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('generate');
  const [testTemplates, setTestTemplates] = useState<TestTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [testConfig, setTestConfig] = useState<TestConfig>({
    componentPath: '',
    componentName: '',
    testType: 'unit',
    includeProps: true,
    includeState: true,
    includeEvents: true,
    mockExternal: true,
    customImports: '',
    customSetup: '',
    customTests: '',
  });
  const [generatedCode, setGeneratedCode] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [copied, setCopied] = useState(false);
  const [appStructure, setAppStructure] = useState<Record<string, string[]>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // 模拟加载应用结构
  useEffect(() => {
    const loadAppStructure = async () => {
      // 模拟异步加载应用结构
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟应用结构数据
      const structure = {
        'app/': ['login/', 'employee/', 'organization/', 'page.tsx', 'layout.tsx'],
        'components/': ['ui/', 'login-form.tsx', 'register-form.tsx', 'employee-honor-fund.tsx'],
        'lib/': ['db.ts', 'schema.ts', 'auth.ts', 'password.ts'],
        'contexts/': ['auth-context.tsx'],
        'api/': ['auth/', 'db/', 'permissions/']
      };
      
      setAppStructure(structure);
      setIsLoading(false);
    };
    
    loadAppStructure();
  }, []);

  // 加载测试模板
  useEffect(() => {
    // 预设的测试模板
    const templates: TestTemplate[] = [
      {
        id: 'react-component-unit',
        name: 'React组件单元测试',
        type: 'unit',
        description: '为React组件生成基础单元测试',
        codeSnippet: `import { render, screen } from '@testing-library/react';
import { {{componentName}} } from '{{componentPath}}';

describe('{{componentName}}', () => {
  it('should render correctly', () => {
    render(<{{componentName}} />);
    // 添加您的断言
  });
});`
      },
      {
        id: 'react-hook-unit',
        name: 'React Hook单元测试',
        type: 'unit',
        description: '为React自定义Hook生成单元测试',
        codeSnippet: `import { renderHook } from '@testing-library/react';
import { use{{componentName}} } from '{{componentPath}}';

describe('use{{componentName}}', () => {
  it('should return correct initial state', () => {
    const { result } = renderHook(() => use{{componentName}}());
    // 添加您的断言
  });
});`
      },
      {
        id: 'api-integration',
        name: 'API集成测试',
        type: 'api',
        description: '为API路由生成集成测试',
        codeSnippet: `import { test } from '@playwright/test';

describe('{{componentName}} API', () => {
  it('should handle request correctly', async ({ request }) => {
    const response = await request.get('/api/{{componentPath}}');
    expect(response.status()).toBe(200);
    // 添加您的断言
  });
});`
      },
      {
        id: 'database-integration',
        name: '数据库集成测试',
        type: 'integration',
        description: '为数据库操作生成集成测试',
        codeSnippet: `import { db } from '@/lib/db';
import { {{componentName}} } from '@/lib/schema';

describe('{{componentName}} Database Operations', () => {
  beforeAll(async () => {
    // 测试前准备
  });
  
  afterAll(async () => {
    // 测试后清理
  });
  
  it('should perform database operation correctly', async () => {
    // 测试数据库操作
  });
});`
      }
    ];
    
    setTestTemplates(templates);
  }, []);

  // 处理配置变更
  const handleConfigChange = <K extends keyof TestConfig>(key: K, value: TestConfig[K]) => {
    setTestConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 生成测试代码
  const generateTestCode = async () => {
    if (!testConfig.componentName || !testConfig.componentPath) {
      return;
    }

    setIsGenerating(true);
    
    // 模拟代码生成过程
    await new Promise(resolve => setTimeout(resolve, 1500));

    let code = '';
    
    // 基于模板或自定义生成代码
    if (selectedTemplate) {
      const template = testTemplates.find(t => t.id === selectedTemplate);
      if (template) {
        code = template.codeSnippet
          .replace(/{{componentName}}/g, testConfig.componentName)
          .replace(/{{componentPath}}/g, testConfig.componentPath);
      }
    } else {
      // 根据测试类型生成默认代码
      code = generateDefaultTestCode();
    }

    // 添加自定义配置
    if (testConfig.customImports) {
      code = testConfig.customImports + '\n\n' + code;
    }
    
    if (testConfig.customSetup) {
      // 在适当位置插入自定义设置
      const setupIndex = code.indexOf('describe(');
      if (setupIndex !== -1) {
        code = code.slice(0, setupIndex) + testConfig.customSetup + '\n\n' + code.slice(setupIndex);
      }
    }
    
    if (testConfig.customTests) {
      // 在描述块末尾添加自定义测试
      const endIndex = code.lastIndexOf('});');
      if (endIndex !== -1) {
        code = code.slice(0, endIndex) + '\n  ' + testConfig.customTests + '\n});';
      }
    }

    setGeneratedCode(code);
    setIsGenerating(false);
  };

  // 生成默认测试代码
  const generateDefaultTestCode = () => {
    switch (testConfig.testType) {
      case 'unit':
        return `import { render, screen, fireEvent } from '@testing-library/react';
import { {{componentName}} } from '{{componentPath}}';

// Mock外部依赖${testConfig.mockExternal ? '\njest.mock(\'@/lib/some-dependency\', () => ({}));' : ''}

describe('{{componentName}}', () => {
  beforeEach(() => {
    // 测试前清理
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    render(<{{componentName}} {{testConfig.includeProps ? 'someProp="value"' : ''}} />);
    // 验证组件渲染
    expect(screen.getByTestId('{{componentName}}')).toBeInTheDocument();
  });

  ${testConfig.includeEvents ? `it('should handle user interaction', () => {
    render(<{{componentName}} />);
    // 模拟用户交互
    const button = screen.getByRole('button');
    fireEvent.click(button);
    // 验证交互结果
  });` : ''}

  ${testConfig.includeState ? `it('should update state correctly', () => {
    render(<{{componentName}} />);
    // 测试状态更新逻辑
  });` : ''}
});`;
      
      case 'api':
        return `import { NextRequest } from 'next/server';
import { createApiResponse } from '@/lib/api-middleware';

// Mock数据库和服务${testConfig.mockExternal ? '\njest.mock(\'@/lib/db\', () => ({}));' : ''}

describe('{{componentName}} API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle POST request successfully', async () => {
    // 准备测试数据
    const requestData = {};
    
    // 创建测试请求
    const req = new NextRequest('http://localhost:3000/api/{{componentPath}}', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    });
    
    // 导入并调用API处理函数
    const { POST } = await import('@/app/api/{{componentPath}}/route');
    const response = await POST(req);
    const data = await response.json();
    
    // 验证响应
    expect(response.status).toBe(200);
  });

  it('should handle validation errors', async () => {
    // 测试无效输入
  });
});`;
      
      case 'integration':
        return `import { db } from '@/lib/db';
import { someService } from '@/lib/services';

// 集成测试通常需要真实或测试数据库连接
describe('{{componentName}} Integration', () => {
  beforeAll(async () => {
    // 测试前准备（如创建测试数据）
  });
  
  afterAll(async () => {
    // 测试后清理（如删除测试数据）
  });

  it('should work end-to-end with database', async () => {
    // 执行完整的业务流程
    const result = await someService.doSomething();
    
    // 验证结果
    expect(result).toBeDefined();
    
    // 可选：直接验证数据库状态
  });
});`;
      
      case 'e2e':
        return `import { test, expect } from '@playwright/test';

test.describe('{{componentName}} E2E Tests', () => {
  test('should work end-to-end', async ({ page }) => {
    // 导航到测试页面
    await page.goto('/{{componentPath}}');
    
    // 验证页面加载
    await expect(page).toHaveTitle(/Some Title/);
    
    // 执行用户操作
    await page.click('button');
    
    // 验证结果
    await expect(page.locator('.result')).toBeVisible();
  });

  test('should handle edge cases', async ({ page }) => {
    // 测试边缘情况
  });
});`;
      
      default:
        return '';
    }
  };

  // 运行测试
  const runTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    
    // 模拟测试运行
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 生成模拟测试结果
    const results: TestResult[] = [
      {
        id: '1',
        status: 'pass',
        name: 'should render correctly',
        duration: 120
      },
      {
        id: '2',
        status: 'pass',
        name: 'should handle user interaction',
        duration: 85
      },
      {
        id: '3',
        status: Math.random() > 0.7 ? 'fail' : 'pass',
        name: 'should update state correctly',
        duration: 150,
        errorMessage: Math.random() > 0.7 ? 'Expected state to update but it did not' : undefined
      },
    ];
    
    setTestResults(results);
    setIsRunningTests(false);
  };

  // 复制生成的代码
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 切换目录展开状态
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // 渲染应用结构树
  const renderAppStructure = () => {
    if (isLoading) {
      return Array(4).fill(0).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full mb-2" />
      ));
    }

    return Object.entries(appStructure).map(([section, files]) => (
      <div key={section} className="mb-2">
        <div 
          className="flex items-center cursor-pointer text-sm font-medium text-slate-700 hover:text-blue-600"
          onClick={() => toggleSection(section)}
        >
          <span className="mr-1">{expandedSections[section] ? '▼' : '▶'}</span>
          {section}
        </div>
        {expandedSections[section] && (
          <div className="ml-4 mt-1 space-y-1">
            {files.map(file => (
              <div 
                key={file}
                className="text-sm text-slate-600 hover:text-blue-600 cursor-pointer"
                onClick={() => {
                  const path = section + file.replace(/\/$/, '');
                  handleConfigChange('componentPath', path);
                  handleConfigChange('componentName', file.replace(/\.tsx?$/, ''));
                }}
              >
                {file}
              </div>
            ))}
          </div>
        )}
      </div>
    ));
  };

  // 获取状态图标
  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'fail':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-slate-400 animate-spin" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">智能测试生成器</h1>
            <p className="text-slate-500 mt-1">自动生成和运行项目测试，提高代码质量</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="secondary" size="sm">
              <HelpCircle className="h-4 w-4 mr-2" />
              使用帮助
            </Button>
            <Button variant="secondary" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              设置
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle>应用结构</CardTitle>
            <CardDescription>浏览项目结构并选择要测试的组件/API</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48 border rounded-md p-4 bg-slate-50">
              {renderAppStructure()}
            </ScrollArea>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Code2 className="h-4 w-4" />
              生成测试
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              测试结果
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              测试模板
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="mt-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="component-name">组件/API名称</Label>
                    <Input
                      id="component-name"
                      value={testConfig.componentName}
                      onChange={(e) => handleConfigChange('componentName', e.target.value)}
                      placeholder="例如: LoginForm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="component-path">文件路径</Label>
                    <Input
                      id="component-path"
                      value={testConfig.componentPath}
                      onChange={(e) => handleConfigChange('componentPath', e.target.value)}
                      placeholder="例如: @/components/login-form"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="test-type">测试类型</Label>
                    <RadioGroup 
                      value={testConfig.testType}
                      onValueChange={(value: TestType) => handleConfigChange('testType', value)}
                      className="flex flex-wrap gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="unit" id="unit" />
                        <Label htmlFor="unit" className="flex items-center gap-1">
                          <Code2 className="h-3 w-3" />
                          单元测试
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="integration" id="integration" />
                        <Label htmlFor="integration" className="flex items-center gap-1">
                          <Layout className="h-3 w-3" />
                          集成测试
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="api" id="api" />
                        <Label htmlFor="api" className="flex items-center gap-1">
                          <Database className="h-3 w-3" />
                          API测试
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="e2e" id="e2e" />
                        <Label htmlFor="e2e" className="flex items-center gap-1">
                          <PlayCircle className="h-3 w-3" />
                          E2E测试
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">测试配置</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="include-props"
                        checked={testConfig.includeProps}
                        onCheckedChange={(checked) => handleConfigChange('includeProps', checked as boolean)}
                      />
                      <Label htmlFor="include-props">包含Props测试</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="include-state"
                        checked={testConfig.includeState}
                        onCheckedChange={(checked) => handleConfigChange('includeState', checked as boolean)}
                      />
                      <Label htmlFor="include-state">包含State测试</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="include-events"
                        checked={testConfig.includeEvents}
                        onCheckedChange={(checked) => handleConfigChange('includeEvents', checked as boolean)}
                      />
                      <Label htmlFor="include-events">包含事件测试</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="mock-external"
                        checked={testConfig.mockExternal}
                        onCheckedChange={(checked) => handleConfigChange('mockExternal', checked as boolean)}
                      />
                      <Label htmlFor="mock-external">Mock外部依赖</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">自定义设置</h3>
                  <div className="space-y-2">
                    <Label htmlFor="custom-imports">自定义导入</Label>
                    <Textarea
                      id="custom-imports"
                      value={testConfig.customImports}
                      onChange={(e) => handleConfigChange('customImports', e.target.value)}
                      placeholder="// 添加自定义导入语句\nimport { someFunction } from 'some-library';"
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="custom-setup">自定义设置</Label>
                    <Textarea
                      id="custom-setup"
                      value={testConfig.customSetup}
                      onChange={(e) => handleConfigChange('customSetup', e.target.value)}
                      placeholder="// 添加自定义测试设置\nconst mockData = {...};"
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="custom-tests">自定义测试用例</Label>
                    <Textarea
                      id="custom-tests"
                      value={testConfig.customTests}
                      onChange={(e) => handleConfigChange('customTests', e.target.value)}
                      placeholder="// 添加自定义测试用例\nit('should handle custom case', () => {\n  // 测试逻辑\n});"
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">生成的测试代码</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[400px] border rounded-md p-4 bg-slate-50 font-mono text-xs">
                      <pre className="whitespace-pre-wrap">
                        {isGenerating ? '生成中...' : (generatedCode || '请配置测试参数并点击生成按钮')}
                      </pre>
                    </ScrollArea>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={generateTestCode}
                      disabled={isGenerating || !testConfig.componentName || !testConfig.componentPath}
                      className="flex items-center gap-2"
                    >
                      <Zap className="h-3 w-3" />
                      生成代码
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={copyToClipboard}
                      disabled={!generatedCode || copied}
                      className="flex items-center gap-2"
                    >
                      {copied ? (
                        <>已复制</>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          复制代码
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>

                <Button 
                  className="w-full flex items-center justify-center gap-2"
                  onClick={runTests}
                  disabled={isRunningTests || !generatedCode}
                >
                  {isRunningTests ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      运行中...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4" />
                      运行测试
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>测试结果</CardTitle>
                <CardDescription>最近一次测试运行的详细结果</CardDescription>
              </CardHeader>
              <CardContent>
                {isRunningTests ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">运行测试中...</span>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    </div>
                    <Progress value={66} className="h-2" />
                  </div>
                ) : testResults.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <Badge variant={testResults.some(r => r.status === 'fail' || r.status === 'error') ? 'destructive' : 'default'}>
                          {testResults.filter(r => r.status === 'pass').length} / {testResults.length} 通过
                        </Badge>
                        <span className="text-sm text-slate-500">
                          总耗时: {testResults.reduce((sum, r) => sum + (r.duration || 0), 0)}ms
                        </span>
                      </div>
                      <Button variant="secondary" size="sm" onClick={runTests} className="flex items-center gap-2">
                        <RefreshCw className="h-3 w-3" />
                        重新运行
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {testResults.map((result) => (
                        <div key={result.id} className="p-3 border rounded-md bg-white">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(result.status)}
                              <span className="text-sm font-medium">{result.name}</span>
                            </div>
                            <Badge variant={
                          result.status === 'pass' ? 'default' :
                          result.status === 'fail' || result.status === 'error' ? 'destructive' : undefined
                        }>
                              {result.status === 'pass' ? '通过' :
                               result.status === 'fail' ? '失败' :
                               result.status === 'error' ? '错误' : '等待'}
                              {result.duration && ` (${result.duration}ms)`}
                            </Badge>
                          </div>
                          {result.errorMessage && (
                            <div className="mt-2 p-2 bg-red-50 text-red-600 text-xs rounded-md">
                              {result.errorMessage}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Alert variant="default" className="text-sm bg-slate-50 border border-slate-200">
                    <AlertDescription>尚未运行测试。请先生成测试代码，然后点击运行测试按钮。</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>测试模板</CardTitle>
                <CardDescription>选择预设模板快速生成测试</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testTemplates.map((template) => (
                    <div 
                      key={template.id}
                      className={`p-4 border rounded-md cursor-pointer transition-colors hover:bg-slate-50 ${selectedTemplate === template.id ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-slate-900">{template.name}</h3>
                          <p className="text-sm text-slate-500 mt-1">{template.description}</p>
                        </div>
                        <Badge variant="outline">
                          {template.type.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="mt-3 p-3 bg-slate-100 rounded-md text-xs font-mono whitespace-pre-wrap">
                        {template.codeSnippet.split('\n').slice(0, 4).join('\n')}
                        {template.codeSnippet.split('\n').length > 4 ? '\n...' : ''}
                      </div>
                    </div>
                  ))}
                </div>
                {selectedTemplate && (
                  <div className="mt-6 flex justify-end">
                    <Button 
                      onClick={() => {
                        const template = testTemplates.find(t => t.id === selectedTemplate);
                        if (template) {
                          handleConfigChange('testType', template.type);
                          setActiveTab('generate');
                        }
                      }}
                      className="gap-2"
                    >
                      <FileDown className="h-4 w-4" />
                      应用模板
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-4 text-sm">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">安全提示</h3>
                <p className="text-blue-700 mt-1">
                  生成的测试代码仅供参考，建议在使用前进行审查和调整，确保测试覆盖您的具体业务逻辑。
                  对于涉及敏感数据的测试，请确保使用适当的mock数据。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}