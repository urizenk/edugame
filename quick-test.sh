#!/bin/bash

# ========================================
# 快速测试脚本 - 云服务器版本
# ========================================

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 教育游戏项目 - 快速测试${NC}"
echo "=================================="

# 获取公网IP
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || echo "localhost")
echo -e "服务器IP: ${YELLOW}$PUBLIC_IP${NC}"
echo ""

# 测试函数
test_endpoint() {
    local url=$1
    local name=$2
    
    echo -n "测试 $name... "
    
    if curl -s --max-time 10 "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 成功${NC}"
        return 0
    else
        echo -e "${RED}❌ 失败${NC}"
        return 1
    fi
}

# 测试本地服务
echo -e "${BLUE}📋 本地服务测试${NC}"
echo "------------------------"
test_endpoint "http://localhost:4001/health" "后端健康检查"
test_endpoint "http://localhost:4001/api/test/full-test" "后端完整测试"
test_endpoint "http://localhost:8080" "前端服务"
echo ""

# 测试公网访问
echo -e "${BLUE}🌐 公网访问测试${NC}"
echo "------------------------"
test_endpoint "http://$PUBLIC_IP:4001/health" "公网后端访问"
test_endpoint "http://$PUBLIC_IP:8080" "公网前端访问"
echo ""

# 显示详细测试结果
echo -e "${BLUE}📊 详细测试结果${NC}"
echo "------------------------"

echo "🔍 后端API详细测试:"
curl -s http://localhost:4001/api/test/full-test | python3 -m json.tool 2>/dev/null || curl -s http://localhost:4001/api/test/full-test

echo ""
echo -e "${BLUE}🔗 访问链接${NC}"
echo "------------------------"
echo -e "前端: ${GREEN}http://$PUBLIC_IP:8080${NC}"
echo -e "后端: ${GREEN}http://$PUBLIC_IP:4001${NC}"
echo -e "测试: ${GREEN}http://$PUBLIC_IP:4001/api/test/full-test${NC}"

echo ""
echo -e "${YELLOW}💡 提示: 如果公网访问失败，请检查云服务器安全组设置${NC}"
