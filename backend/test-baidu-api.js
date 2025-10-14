// 测试百度语音识别API密钥
require('dotenv').config();

const API_KEY = process.env.BAIDU_API_KEY;
const SECRET_KEY = process.env.BAIDU_SECRET_KEY;

console.log('📋 当前配置:');
console.log('API_KEY:', API_KEY);
console.log('SECRET_KEY:', SECRET_KEY);
console.log('');

async function testBaiduToken() {
    console.log('🔍 正在测试百度API密钥...\n');

    if (!API_KEY || !SECRET_KEY) {
        console.error('❌ 错误: 未配置API密钥！');
        return;
    }

    const params = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: API_KEY,
        client_secret: SECRET_KEY
    });

    const url = `https://aip.baidubce.com/oauth/2.0/token?${params.toString()}`;
    console.log('📡 请求URL:', url);
    console.log('');

    try {
        const response = await fetch(url, { method: 'POST' });

        console.log('📥 响应状态:', response.status, response.statusText);

        const data = await response.json();
        console.log('📦 响应数据:', JSON.stringify(data, null, 2));
        console.log('');

        if (response.ok && data.access_token) {
            console.log('✅ 成功! Access Token:', data.access_token.substring(0, 50) + '...');
            console.log('⏰ 有效期:', data.expires_in, '秒');
            console.log('');
            console.log('🎉 API密钥配置正确，可以正常使用！');
        } else {
            console.log('❌ 失败! 可能的原因:');
            console.log('   1. API Key 或 Secret Key 错误');
            console.log('   2. 应用未在百度云控制台启用');
            console.log('   3. 网络连接问题');
            console.log('');
            console.log('💡 请检查:');
            console.log('   - 访问 https://console.bce.baidu.com/ai/#/ai/speech/overview/index');
            console.log('   - 确认应用"教育识别"(AppID: 7114088)已启用');
            console.log('   - 复制正确的API Key和Secret Key');
        }
    } catch (error) {
        console.error('❌ 请求失败:', error.message);
    }
}

testBaiduToken();

