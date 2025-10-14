#!/bin/bash

# ========================================
# 修复服务器测试脚本
# ========================================

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 修复服务器测试问题${NC}"
echo "=================================="

cd /root/edu-game

# 1. 检查文件是否存在
echo -e "${BLUE}📋 检查项目文件${NC}"
if [ -f "test-system.js" ]; then
    echo -e "${GREEN}✅ test-system.js 存在${NC}"
else
    echo -e "${RED}❌ test-system.js 不存在，正在创建...${NC}"
    
    # 创建测试脚本
    cat > test-system.js << 'EOF'
#!/usr/bin/env node

const http = require('http');

// 配置
const config = {
  backend: {
    host: process.env.BACKEND_HOST || 'localhost',
    port: process.env.BACKEND_PORT || 4001,
    protocol: process.env.BACKEND_PROTOCOL || 'http'
  },
  frontend: {
    host: process.env.FRONTEND_HOST || 'localhost',
    port: process.env.FRONTEND_PORT || 4173,
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
    const req = http.request(options, (res) => {
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
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
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
    { path: '/api/test/full-test', name: '完整测试API' }
  ];

  let passedTests = 0;

  for (const test of tests) {
    try {
      const response = await makeRequest({
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
    { name: '前端服务测试', fn: testFrontend }
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

// 运行测试
runAllTests().catch(error => {
  console.error(`测试运行失败: ${error.message}`);
  process.exit(1);
});
EOF

    chmod +x test-system.js
    echo -e "${GREEN}✅ test-system.js 创建完成${NC}"
fi

# 2. 检查服务状态
echo ""
echo -e "${BLUE}📋 检查服务状态${NC}"

# 检查后端
if curl -s http://localhost:4001/health > /dev/null; then
    echo -e "${GREEN}✅ 后端服务正常 (端口 4001)${NC}"
else
    echo -e "${RED}❌ 后端服务异常${NC}"
fi

# 检查前端 (Vite preview 默认端口是 4173)
if curl -s http://localhost:4173 > /dev/null; then
    echo -e "${GREEN}✅ 前端服务正常 (端口 4173)${NC}"
elif curl -s http://localhost:8080 > /dev/null; then
    echo -e "${GREEN}✅ 前端服务正常 (端口 8080)${NC}"
else
    echo -e "${YELLOW}⚠️  前端服务可能需要重启${NC}"
fi

# 3. 获取公网IP并显示访问地址
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || echo "localhost")

echo ""
echo -e "${BLUE}🌐 访问地址${NC}"
echo "------------------------"
echo -e "前端: ${GREEN}http://$PUBLIC_IP:4173${NC}"
echo -e "后端: ${GREEN}http://$PUBLIC_IP:4001${NC}"
echo -e "测试: ${GREEN}http://$PUBLIC_IP:4001/api/test/full-test${NC}"

# 4. 运行测试
echo ""
echo -e "${BLUE}🧪 运行系统测试${NC}"
echo "------------------------"

# 设置正确的前端端口
export FRONTEND_PORT=4173

node test-system.js

echo ""
echo -e "${BLUE}🔧 手动测试命令${NC}"
echo "------------------------"
echo "# 测试后端健康检查"
echo "curl http://$PUBLIC_IP:4001/health"
echo ""
echo "# 测试完整系统"
echo "curl http://$PUBLIC_IP:4001/api/test/full-test"
echo ""
echo "# 测试前端页面"
echo "curl -I http://$PUBLIC_IP:4173"
echo ""
echo "# 配置防火墙 (如果需要)"
echo "sudo ufw allow 4173/tcp"
echo "sudo ufw allow 4001/tcp"

echo ""
echo -e "${GREEN}🎊 测试修复完成！${NC}"
