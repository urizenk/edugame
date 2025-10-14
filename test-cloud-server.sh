#!/bin/bash

# ========================================
# 云服务器测试脚本
# 用于在云服务器上部署并测试教育游戏项目
# ========================================

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 日志函数
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_test() { echo -e "${CYAN}🧪 $1${NC}"; }

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║            云服务器测试部署脚本                      ║"
echo "║        教育游戏项目 - 完整测试服务                   ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# 获取服务器信息
PUBLIC_IP=$(curl -s ifconfig.me || curl -s icanhazip.com || echo "未知")
HOSTNAME=$(hostname)
OS_INFO=$(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)

log_info "服务器信息:"
echo "  - 公网IP: $PUBLIC_IP"
echo "  - 主机名: $HOSTNAME"
echo "  - 系统: $OS_INFO"
echo ""

# 1. 系统环境检查
log_test "步骤 1/8: 检查系统环境"
echo "----------------------------------------"

# 检查必要工具
check_command() {
    if command -v $1 &> /dev/null; then
        log_success "$1 已安装"
        return 0
    else
        log_error "$1 未安装"
        return 1
    fi
}

MISSING_TOOLS=()

if ! check_command "git"; then MISSING_TOOLS+=("git"); fi
if ! check_command "node"; then MISSING_TOOLS+=("nodejs"); fi
if ! check_command "npm"; then MISSING_TOOLS+=("npm"); fi
if ! check_command "docker"; then MISSING_TOOLS+=("docker.io"); fi
if ! check_command "curl"; then MISSING_TOOLS+=("curl"); fi

if [ ${#MISSING_TOOLS[@]} -gt 0 ]; then
    log_warning "需要安装缺失的工具: ${MISSING_TOOLS[*]}"
    log_info "正在安装..."
    
    sudo apt-get update
    for tool in "${MISSING_TOOLS[@]}"; do
        sudo apt-get install -y $tool
    done
    
    # 如果安装了 nodejs，检查版本
    if [[ " ${MISSING_TOOLS[*]} " =~ " nodejs " ]]; then
        NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -lt 16 ]; then
            log_warning "Node.js 版本过低，正在安装 Node.js 18..."
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs
        fi
    fi
fi

log_success "系统环境检查完成"
echo ""

# 2. 清理旧部署
log_test "步骤 2/8: 清理旧部署"
echo "----------------------------------------"

# 停止旧容器
docker stop edu-game-backend edu-game-frontend 2>/dev/null || true
docker rm edu-game-backend edu-game-frontend 2>/dev/null || true

# 停止可能占用端口的服务
sudo systemctl stop nginx 2>/dev/null || true
sudo systemctl stop apache2 2>/dev/null || true

# 释放端口
sudo fuser -k 8080/tcp 2>/dev/null || true
sudo fuser -k 4001/tcp 2>/dev/null || true

# 清理旧项目
if [ -d "edu-game" ]; then
    log_info "删除旧项目目录..."
    rm -rf edu-game
fi

log_success "清理完成"
echo ""

# 3. 克隆项目
log_test "步骤 3/8: 克隆项目"
echo "----------------------------------------"

log_info "从 Gitee 克隆项目..."
git clone https://gitee.com/dot123dot/edu-game.git
cd edu-game

log_success "项目克隆完成"
echo ""

# 4. 安装依赖
log_test "步骤 4/8: 安装依赖"
echo "----------------------------------------"

log_info "安装后端依赖..."
cd backend
npm ci

log_info "安装前端依赖..."
cd ../frontend
npm ci

cd ..
log_success "依赖安装完成"
echo ""

# 5. 构建项目
log_test "步骤 5/8: 构建项目"
echo "----------------------------------------"

log_info "构建后端..."
cd backend
npm run build

log_info "构建前端..."
cd ../frontend
npm run build

cd ..
log_success "项目构建完成"
echo ""

# 6. 启动服务
log_test "步骤 6/8: 启动服务"
echo "----------------------------------------"

log_info "启动后端服务..."
cd backend
npm start &
BACKEND_PID=$!

log_info "等待后端启动..."
sleep 10

# 检查后端是否启动成功
if curl -s http://localhost:4001/health > /dev/null; then
    log_success "后端服务启动成功"
else
    log_error "后端服务启动失败"
    exit 1
fi

log_info "启动前端服务..."
cd ../frontend
npm run preview &
FRONTEND_PID=$!

log_info "等待前端启动..."
sleep 5

cd ..
log_success "服务启动完成"
echo ""

# 7. 配置防火墙
log_test "步骤 7/8: 配置防火墙"
echo "----------------------------------------"

log_info "配置防火墙规则..."
sudo ufw allow 8080/tcp 2>/dev/null || true
sudo ufw allow 4001/tcp 2>/dev/null || true

log_success "防火墙配置完成"
echo ""

# 8. 运行测试
log_test "步骤 8/8: 运行系统测试"
echo "----------------------------------------"

log_info "等待服务完全启动..."
sleep 5

log_info "运行本地测试..."
node test-system.js

echo ""
log_success "🎉 部署和测试完成！"
echo ""

# 显示访问信息
echo -e "${CYAN}📋 服务访问信息${NC}"
echo "========================================"
echo -e "🌐 前端地址: ${GREEN}http://$PUBLIC_IP:8080${NC}"
echo -e "🔧 后端地址: ${GREEN}http://$PUBLIC_IP:4001${NC}"
echo -e "🧪 健康检查: ${GREEN}http://$PUBLIC_IP:4001/health${NC}"
echo -e "🔍 测试API: ${GREEN}http://$PUBLIC_IP:4001/api/test/full-test${NC}"
echo ""

# 显示测试命令
echo -e "${CYAN}🧪 手动测试命令${NC}"
echo "========================================"
echo "# 测试后端健康检查"
echo "curl http://$PUBLIC_IP:4001/health"
echo ""
echo "# 测试完整系统"
echo "curl http://$PUBLIC_IP:4001/api/test/full-test"
echo ""
echo "# 测试前端页面"
echo "curl -I http://$PUBLIC_IP:8080"
echo ""
echo "# 运行集成测试"
echo "BACKEND_HOST=$PUBLIC_IP FRONTEND_HOST=$PUBLIC_IP node test-system.js"
echo ""

# 显示管理命令
echo -e "${CYAN}🔧 服务管理命令${NC}"
echo "========================================"
echo "# 查看后端日志"
echo "tail -f backend/logs/app.log"
echo ""
echo "# 重启后端服务"
echo "kill $BACKEND_PID && cd backend && npm start &"
echo ""
echo "# 重启前端服务"
echo "kill $FRONTEND_PID && cd frontend && npm run preview &"
echo ""
echo "# 停止所有服务"
echo "kill $BACKEND_PID $FRONTEND_PID"
echo ""

# 保存进程ID
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid

log_success "🎊 云服务器部署完成！服务正在运行中..."

# 提示用户测试
echo ""
echo -e "${YELLOW}💡 下一步操作建议:${NC}"
echo "1. 在浏览器中访问: http://$PUBLIC_IP:8080"
echo "2. 测试API接口: curl http://$PUBLIC_IP:4001/api/test/full-test"
echo "3. 运行远程测试: BACKEND_HOST=$PUBLIC_IP FRONTEND_HOST=$PUBLIC_IP node test-system.js"
echo "4. 检查云服务器安全组是否开放了 8080 和 4001 端口"
echo ""

# 等待用户输入
read -p "按 Enter 键继续，或 Ctrl+C 退出..."

# 实时监控服务状态
log_info "开始实时监控服务状态 (Ctrl+C 退出)..."
while true; do
    clear
    echo -e "${CYAN}🔄 实时服务状态监控${NC}"
    echo "========================================"
    echo "时间: $(date)"
    echo ""
    
    # 检查后端状态
    if curl -s http://localhost:4001/health > /dev/null; then
        echo -e "后端状态: ${GREEN}✅ 正常${NC}"
    else
        echo -e "后端状态: ${RED}❌ 异常${NC}"
    fi
    
    # 检查前端状态
    if curl -s http://localhost:8080 > /dev/null; then
        echo -e "前端状态: ${GREEN}✅ 正常${NC}"
    else
        echo -e "前端状态: ${RED}❌ 异常${NC}"
    fi
    
    # 显示进程状态
    echo ""
    echo "进程状态:"
    if ps -p $BACKEND_PID > /dev/null; then
        echo -e "后端进程: ${GREEN}✅ 运行中 (PID: $BACKEND_PID)${NC}"
    else
        echo -e "后端进程: ${RED}❌ 已停止${NC}"
    fi
    
    if ps -p $FRONTEND_PID > /dev/null; then
        echo -e "前端进程: ${GREEN}✅ 运行中 (PID: $FRONTEND_PID)${NC}"
    else
        echo -e "前端进程: ${RED}❌ 已停止${NC}"
    fi
    
    echo ""
    echo "访问地址:"
    echo "前端: http://$PUBLIC_IP:8080"
    echo "后端: http://$PUBLIC_IP:4001"
    
    sleep 5
done
