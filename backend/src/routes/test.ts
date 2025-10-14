import { Router } from 'express';
import env from '../config/env';
import * as baiduSpeechService from '../services/baiduSpeech';

const router = Router();

// 系统健康检查
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 环境变量检查
router.get('/env-check', (req, res) => {
  const envStatus = {
    port: env.port,
    corsOrigin: env.corsOrigin,
    baiduApiKey: env.baiduApiKey ? '已配置' : '未配置',
    baiduSecretKey: env.baiduSecretKey ? '已配置' : '未配置',
    baiduDevPid: env.baiduDevPid,
    authSecret: env.authSecret ? '已配置' : '未配置',
    nodeEnv: process.env.NODE_ENV || 'development'
  };

  const allConfigured = env.baiduApiKey && env.baiduSecretKey && env.authSecret;

  res.json({
    status: allConfigured ? 'ok' : 'warning',
    message: allConfigured ? '所有环境变量已正确配置' : '部分环境变量未配置',
    config: envStatus
  });
});

// 百度API连接测试
router.get('/baidu-test', async (req, res) => {
  try {
    if (!env.baiduApiKey || !env.baiduSecretKey) {
      return res.status(400).json({
        status: 'error',
        message: '百度API密钥未配置'
      });
    }

    // 测试获取访问令牌
    const token = await baiduSpeechService.getAccessToken();
    
    res.json({
      status: 'ok',
      message: '百度API连接正常',
      tokenLength: token.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '百度API连接失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 数据库连接测试（如果有的话）
router.get('/database-test', (req, res) => {
  // 这里可以添加数据库连接测试
  res.json({
    status: 'ok',
    message: '当前项目未使用数据库',
    timestamp: new Date().toISOString()
  });
});

// 完整系统测试
router.get('/full-test', async (req, res) => {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [] as any[]
  };

  // 1. 健康检查
  results.tests.push({
    name: '系统健康检查',
    status: 'ok',
    message: '系统运行正常',
    uptime: process.uptime()
  });

  // 2. 环境变量检查
  const envConfigured = env.baiduApiKey && env.baiduSecretKey && env.authSecret;
  results.tests.push({
    name: '环境变量检查',
    status: envConfigured ? 'ok' : 'warning',
    message: envConfigured ? '环境变量配置完整' : '部分环境变量未配置'
  });

  // 3. 百度API测试
  try {
    if (env.baiduApiKey && env.baiduSecretKey) {
      await baiduSpeechService.getAccessToken();
      results.tests.push({
        name: '百度API连接测试',
        status: 'ok',
        message: 'API连接正常'
      });
    } else {
      results.tests.push({
        name: '百度API连接测试',
        status: 'skip',
        message: 'API密钥未配置，跳过测试'
      });
    }
  } catch (error) {
    results.tests.push({
      name: '百度API连接测试',
      status: 'error',
      message: `API连接失败: ${error instanceof Error ? error.message : '未知错误'}`
    });
  }

  // 4. 内存使用检查
  const memUsage = process.memoryUsage();
  const memoryOk = memUsage.heapUsed < 100 * 1024 * 1024; // 小于100MB
  results.tests.push({
    name: '内存使用检查',
    status: memoryOk ? 'ok' : 'warning',
    message: `堆内存使用: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    details: memUsage
  });

  const overallStatus = results.tests.every(t => t.status === 'ok') ? 'ok' : 
                       results.tests.some(t => t.status === 'error') ? 'error' : 'warning';

  res.json({
    status: overallStatus,
    message: `测试完成，${results.tests.length}项测试`,
    summary: {
      total: results.tests.length,
      passed: results.tests.filter(t => t.status === 'ok').length,
      warnings: results.tests.filter(t => t.status === 'warning').length,
      errors: results.tests.filter(t => t.status === 'error').length,
      skipped: results.tests.filter(t => t.status === 'skip').length
    },
    results
  });
});

// 模拟语音识别测试
router.post('/mock-speech-test', (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({
      status: 'error',
      message: '请提供测试文本'
    });
  }

  // 模拟语音识别结果
  res.json({
    status: 'ok',
    message: '模拟语音识别成功',
    result: {
      text: text,
      confidence: 0.95,
      timestamp: new Date().toISOString(),
      mockData: true
    }
  });
});

export default router;
