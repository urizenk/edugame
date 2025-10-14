import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

interface TestResult {
    name: string;
    status: 'ok' | 'error' | 'warning' | 'skip' | 'loading';
    message: string;
    details?: any;
}

interface SystemStatus {
    status: string;
    timestamp: string;
    uptime: number;
    memory: any;
    environment: string;
}

const TestPanel: React.FC = () => {
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    // 单个测试函数
    const runSingleTest = async (testName: string, endpoint: string): Promise<TestResult> => {
        try {
            const response = await apiFetch(endpoint);
            return {
                name: testName,
                status: response.status === 'ok' ? 'ok' : response.status === 'warning' ? 'warning' : 'error',
                message: response.message || '测试完成',
                details: response
            };
        } catch (error) {
            return {
                name: testName,
                status: 'error',
                message: error instanceof Error ? error.message : '测试失败',
                details: error
            };
        }
    };

    // 运行所有测试
    const runAllTests = async () => {
        setIsRunning(true);
        setTestResults([]);

        const tests = [
            { name: '系统健康检查', endpoint: '/api/test/health' },
            { name: '环境变量检查', endpoint: '/api/test/env-check' },
            { name: '百度API连接测试', endpoint: '/api/test/baidu-test' },
            { name: '数据库连接测试', endpoint: '/api/test/database-test' }
        ];

        const results: TestResult[] = [];

        for (const test of tests) {
            // 显示加载状态
            setTestResults([...results, { ...test, status: 'loading', message: '测试中...' }]);

            const result = await runSingleTest(test.name, test.endpoint);
            results.push(result);
            setTestResults([...results]);

            // 添加延迟，让用户看到测试过程
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        setIsRunning(false);
    };

    // 运行完整测试
    const runFullTest = async () => {
        setIsRunning(true);
        try {
            const response = await apiFetch('/api/test/full-test');
            setTestResults(response.results.tests.map((test: any) => ({
                name: test.name,
                status: test.status,
                message: test.message,
                details: test.details
            })));
        } catch (error) {
            setTestResults([{
                name: '完整测试',
                status: 'error',
                message: error instanceof Error ? error.message : '测试失败'
            }]);
        }
        setIsRunning(false);
    };

    // 获取系统状态
    const getSystemStatus = async () => {
        try {
            const status = await apiFetch('/api/test/health');
            setSystemStatus(status);
        } catch (error) {
            console.error('获取系统状态失败:', error);
        }
    };

    // 测试前后端连接
    const testConnection = async () => {
        const result = await runSingleTest('前后端连接测试', '/api/test/health');
        setTestResults([result]);
    };

    useEffect(() => {
        getSystemStatus();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ok': return 'text-green-600';
            case 'warning': return 'text-yellow-600';
            case 'error': return 'text-red-600';
            case 'loading': return 'text-blue-600';
            case 'skip': return 'text-gray-600';
            default: return 'text-gray-600';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ok': return '✅';
            case 'warning': return '⚠️';
            case 'error': return '❌';
            case 'loading': return '🔄';
            case 'skip': return '⏭️';
            default: return '❓';
        }
    };

    return (
        <div className="fixed top-4 right-4 w-96 bg-white rounded-lg shadow-lg border p-4 z-50">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">🧪 系统测试面板</h3>
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                >
                    {showDetails ? '隐藏详情' : '显示详情'}
                </button>
            </div>

            {/* 系统状态 */}
            {systemStatus && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                    <h4 className="font-medium text-gray-700 mb-2">系统状态</h4>
                    <div className="text-sm space-y-1">
                        <div>状态: <span className={getStatusColor(systemStatus.status)}>{systemStatus.status}</span></div>
                        <div>运行时间: {Math.floor(systemStatus.uptime)}秒</div>
                        <div>环境: {systemStatus.environment}</div>
                        {showDetails && (
                            <div className="mt-2 text-xs text-gray-600">
                                <div>内存使用: {Math.round(systemStatus.memory.heapUsed / 1024 / 1024)}MB</div>
                                <div>时间戳: {new Date(systemStatus.timestamp).toLocaleString()}</div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 测试按钮 */}
            <div className="flex flex-wrap gap-2 mb-4">
                <button
                    onClick={testConnection}
                    disabled={isRunning}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    连接测试
                </button>
                <button
                    onClick={runAllTests}
                    disabled={isRunning}
                    className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                    逐步测试
                </button>
                <button
                    onClick={runFullTest}
                    disabled={isRunning}
                    className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
                >
                    完整测试
                </button>
                <button
                    onClick={getSystemStatus}
                    disabled={isRunning}
                    className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                >
                    刷新状态
                </button>
            </div>

            {/* 测试结果 */}
            {testResults.length > 0 && (
                <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">测试结果</h4>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                        {testResults.map((result, index) => (
                            <div key={index} className="p-2 border rounded text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">{result.name}</span>
                                    <span className={`${getStatusColor(result.status)} font-medium`}>
                                        {getStatusIcon(result.status)} {result.status.toUpperCase()}
                                    </span>
                                </div>
                                <div className="text-gray-600 mt-1">{result.message}</div>
                                {showDetails && result.details && (
                                    <details className="mt-2">
                                        <summary className="text-xs text-blue-600 cursor-pointer">详细信息</summary>
                                        <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-x-auto">
                                            {JSON.stringify(result.details, null, 2)}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 加载状态 */}
            {isRunning && (
                <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <div className="text-sm text-gray-600 mt-2">测试进行中...</div>
                </div>
            )}
        </div>
    );
};

export default TestPanel;
