#!/usr/bin/env node

/**
 * 教育游戏项目 - 系统集成测试脚本
 * 用于测试前后端服务的完整功能
 */

const http = require('http');
const https = require('https');

// 配置
const config = {
    backend: {
        host: process.env.BACKEND_HOST || 'localhost',
        port: process.env.BACKEND_PORT || 4001,
        protocol: process.env.BACKEND_PROTOCOL || 'http'
    },
    frontend: {
        host: process.env.FRONTEND_HOST || 'localhost',
        port: process.env.FRONTEND_PORT || 8080,
        protocol: process.env.FRONTEND_PROTOCOL || 'http'
    }
};

// 颜色输出
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

const log = {
    info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    test: (msg) => console.log(`${colors.cyan}🧪 ${msg}${colors.reset}`)
};

// HTTP 请求函数
function makeRequest(options) {
    return new Promise((resolve, reject) => {
        const client = options.protocol === 'https' ? https : http;

        const req = client.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = data ? JSON.parse(data) : {};
                    resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data, headers: res.headers });
                }
            });
        });

        req.on('error', reject);

        if (options.body) {
            req.write(JSON.stringify(options.body));
        }

        req.end();
    });
}

// 测试函数
async function testBackendHealth() {
    log.test('测试后端健康检查...');

    try {
        const response = await makeRequest({
            protocol: config.backend.protocol,
            hostname: config.backend.host,
            port: config.backend.port,
            path: '/health',
            method: 'GET'
        });

        if (response.status === 200 && response.data.status === 'ok') {
            log.success('后端健康检查通过');
            return true;
        } else {
            log.error(`后端健康检查失败: ${response.status}`);
            return false;
        }
    } catch (error) {
        log.error(`后端连接失败: ${error.message}`);
        return false;
    }
}

async function testBackendAPI() {
    log.test('测试后端API接口...');

    const tests = [
        { path: '/api/test/health', name: '健康检查API' },
        { path: '/api/test/env-check', name: '环境变量检查API' },
        { path: '/api/test/baidu-test', name: '百度API测试' },
        { path: '/api/test/full-test', name: '完整测试API' }
    ];

    let passedTests = 0;

    for (const test of tests) {
        try {
            const response = await makeRequest({
                protocol: config.backend.protocol,
                hostname: config.backend.host,
                port: config.backend.port,
                path: test.path,
                method: 'GET'
            });

            if (response.status === 200) {
                log.success(`${test.name} - 通过`);
                passedTests++;
            } else {
                log.warning(`${test.name} - 状态码: ${response.status}`);
            }
        } catch (error) {
            log.error(`${test.name} - 失败: ${error.message}`);
        }
    }

    log.info(`API测试完成: ${passedTests}/${tests.length} 通过`);
    return passedTests === tests.length;
}

async function testFrontend() {
    log.test('测试前端服务...');

    try {
        const response = await makeRequest({
            protocol: config.frontend.protocol,
            hostname: config.frontend.host,
            port: config.frontend.port,
            path: '/',
            method: 'GET'
        });

        if (response.status === 200) {
            log.success('前端服务正常');
            return true;
        } else {
            log.error(`前端服务异常: ${response.status}`);
            return false;
        }
    } catch (error) {
        log.error(`前端连接失败: ${error.message}`);
        return false;
    }
}

async function testCORS() {
    log.test('测试CORS配置...');

    try {
        const response = await makeRequest({
            protocol: config.backend.protocol,
            hostname: config.backend.host,
            port: config.backend.port,
            path: '/health',
            method: 'OPTIONS',
            headers: {
                'Origin': `${config.frontend.protocol}://${config.frontend.host}:${config.frontend.port}`,
                'Access-Control-Request-Method': 'GET'
            }
        });

        const corsHeaders = response.headers['access-control-allow-origin'];
        if (corsHeaders) {
            log.success('CORS配置正常');
            return true;
        } else {
            log.warning('CORS配置可能有问题');
            return false;
        }
    } catch (error) {
        log.error(`CORS测试失败: ${error.message}`);
        return false;
    }
}

async function testMockSpeech() {
    log.test('测试模拟语音识别...');

    try {
        const response = await makeRequest({
            protocol: config.backend.protocol,
            hostname: config.backend.host,
            port: config.backend.port,
            path: '/api/test/mock-speech-test',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: { text: '这是一个测试文本' }
        });

        if (response.status === 200 && response.data.status === 'ok') {
            log.success('模拟语音识别测试通过');
            return true;
        } else {
            log.error(`模拟语音识别测试失败: ${response.status}`);
            return false;
        }
    } catch (error) {
        log.error(`模拟语音识别测试失败: ${error.message}`);
        return false;
    }
}

// 主测试函数
async function runAllTests() {
    console.log(`${colors.cyan}
╔══════════════════════════════════════╗
║        教育游戏项目 - 系统测试        ║
╚══════════════════════════════════════╝${colors.reset}
`);

    log.info('开始系统集成测试...');
    log.info(`后端地址: ${config.backend.protocol}://${config.backend.host}:${config.backend.port}`);
    log.info(`前端地址: ${config.frontend.protocol}://${config.frontend.host}:${config.frontend.port}`);

    console.log('\n' + '='.repeat(50));

    const tests = [
        { name: '后端健康检查', fn: testBackendHealth },
        { name: '后端API测试', fn: testBackendAPI },
        { name: '前端服务测试', fn: testFrontend },
        { name: 'CORS配置测试', fn: testCORS },
        { name: '模拟语音识别测试', fn: testMockSpeech }
    ];

    const results = [];

    for (const test of tests) {
        console.log(`\n📋 ${test.name}`);
        console.log('-'.repeat(30));

        const startTime = Date.now();
        const result = await test.fn();
        const duration = Date.now() - startTime;

        results.push({
            name: test.name,
            passed: result,
            duration
        });

        log.info(`耗时: ${duration}ms`);
    }

    // 测试总结
    console.log('\n' + '='.repeat(50));
    console.log(`${colors.cyan}📊 测试总结${colors.reset}`);
    console.log('='.repeat(50));

    const passed = results.filter(r => r.passed).length;
    const total = results.length;

    results.forEach(result => {
        const status = result.passed ? `${colors.green}✅ 通过` : `${colors.red}❌ 失败`;
        console.log(`${result.name}: ${status}${colors.reset} (${result.duration}ms)`);
    });

    console.log(`\n总计: ${passed}/${total} 测试通过`);

    if (passed === total) {
        log.success('🎉 所有测试通过！系统运行正常！');
        process.exit(0);
    } else {
        log.error(`❌ ${total - passed} 个测试失败，请检查系统配置`);
        process.exit(1);
    }
}

// 显示帮助信息
function showHelp() {
    console.log(`
教育游戏项目 - 系统测试脚本

使用方法:
  node test-system.js [选项]

环境变量:
  BACKEND_HOST      后端主机地址 (默认: localhost)
  BACKEND_PORT      后端端口 (默认: 4001)
  BACKEND_PROTOCOL  后端协议 (默认: http)
  FRONTEND_HOST     前端主机地址 (默认: localhost)
  FRONTEND_PORT     前端端口 (默认: 8080)
  FRONTEND_PROTOCOL 前端协议 (默认: http)

示例:
  # 本地测试
  node test-system.js

  # 测试部署的服务
  BACKEND_HOST=your-backend.railway.app BACKEND_PROTOCOL=https \\
  FRONTEND_HOST=your-frontend.vercel.app FRONTEND_PROTOCOL=https \\
  node test-system.js
`);
}

// 处理命令行参数
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showHelp();
    process.exit(0);
}

// 运行测试
runAllTests().catch(error => {
    log.error(`测试运行失败: ${error.message}`);
    process.exit(1);
});
