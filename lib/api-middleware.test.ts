import { ApiError, createApiResponse } from './api-middleware';

// 模拟NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      ...options,
      json: () => data
    }))
  }
}));

// 获取模拟的NextResponse.json函数
const mockNextResponseJson = jest.requireMock('next/server').NextResponse.json;

describe('ApiError', () => {
  test('creates ApiError with default properties', () => {
    const error = new ApiError('Test error', 500);
    
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Test error');
    expect(error.status).toBe(500);
  });

  test('creates ApiError with custom properties', () => {
    const errors = { username: 'Invalid username' };
    const error = new ApiError('Validation failed', 400, errors);
    
    expect(error.message).toBe('Validation failed');
    expect(error.status).toBe(400);
    expect(error.errors).toEqual(errors);
  });
});

describe('createApiResponse', () => {
  beforeEach(() => {
    mockNextResponseJson.mockClear();
  });

  test('creates successful response with default status code 200', () => {
    const data = { success: true, message: 'Operation successful' };
    createApiResponse(data);
    
    // 验证NextResponse.json被正确调用
    expect(mockNextResponseJson).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: '操作成功',
        data
      }),
      { status: 200 }
    );
  });

  test('creates successful response with custom status code', () => {
    const data = { id: 123, name: 'Test Item' };
    createApiResponse(data, { status: 201 });
    
    expect(mockNextResponseJson).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: '操作成功',
        data
      }),
      { status: 201 }
    );
  });

  test('creates successful response with custom message', () => {
    const data = { items: [] };
    createApiResponse(data, { message: 'Data retrieved successfully' });
    
    expect(mockNextResponseJson).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Data retrieved successfully',
        data
      }),
      { status: 200 }
    );
  });

  test('creates error response with error status code', () => {
    createApiResponse(null, { status: 404, message: 'Resource not found' });
    
    expect(mockNextResponseJson).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Resource not found',
        data: null
      }),
      { status: 404 }
    );
  });

  test('properly handles empty data', () => {
    createApiResponse(null);
    
    expect(mockNextResponseJson).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: '操作成功',
        data: null
      }),
      { status: 200 }
    );
  });
});