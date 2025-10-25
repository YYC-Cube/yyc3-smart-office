#!/bin/bash
# === 脚本健康检查头 ===
set -euo pipefail  # 严格模式
trap "cleanup" EXIT INT TERM

# 清理函数
cleanup() {
    echo "🔍 诊断脚本执行完成"
}

# 系统信息
check_system_health() {
    echo "🏥 系统健康检查开始"
    echo "📦 Node.js 版本: $(node -v)"
    echo "📦 npm 版本: $(npm -v)"
    echo "📦 操作系统: $(uname -a)"
    echo "📁 当前目录: $(pwd)"
    echo "💾 磁盘空间: $(df -h . | tail -1)"
    echo "🏥 系统健康检查完成"
}

# 项目依赖检查
check_dependencies() {
    echo "📦 项目依赖检查开始"
    if [ -f "package.json" ]; then
        echo "✅ package.json 存在"
        echo "🔍 核心依赖版本:"
        grep -E '"next"|"react"|"typescript"|"tailwindcss"' package.json
    else
        echo "❌ package.json 不存在"
        exit 1
    fi
    
    if [ -f "node_modules/.package-lock.json" ] || [ -f "package-lock.json" ]; then
        echo "✅ 依赖已安装"
    else
        echo "⚠️  依赖未安装，建议运行: npm install"
    fi
    echo "📦 项目依赖检查完成"
}

# 项目文件结构检查
check_project_structure() {
    echo "📁 项目文件结构检查开始"
    local required_files=("tailwind.config.js" "app/globals.css" "app/layout.tsx" "next-env.d.ts")
    
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            echo "✅ $file 存在"
        else
            echo "❌ $file 不存在"
        fi
    done
    
    # 检查页面目录
    if [ -d "app" ] && [ "$(ls -A app 2>/dev/null)" ]; then
        echo "✅ app 目录存在且包含内容"
        echo "🔍 页面列表:"
        find app -name "page.tsx" | sort
    else
        echo "❌ app 目录不存在或为空"
    fi
    echo "📁 项目文件结构检查完成"
}

# 配置文件检查
check_config_files() {
    echo "⚙️  配置文件检查开始"
    
    if [ -f "tailwind.config.js" ]; then
        echo "✅ tailwind.config.js 存在"
        # 检查内容
        if grep -q "content:" tailwind.config.js; then
            echo "✅ tailwind.config.js 包含 content 配置"
        else
            echo "❌ tailwind.config.js 缺少 content 配置"
        fi
    else
        echo "❌ tailwind.config.js 不存在"
    fi
    
    if [ -f "app/globals.css" ]; then
        echo "✅ globals.css 存在"
        # 检查是否包含必要的导入
        if grep -q "@tailwind base;" app/globals.css; then
            echo "✅ globals.css 包含 @tailwind base"
        else
            echo "❌ globals.css 缺少 @tailwind base"
        fi
        # 检查自定义类
        if grep -q ".btn-3d" app/globals.css; then
            echo "✅ btn-3d 类已定义"
        else
            echo "❌ btn-3d 类未定义"
        fi
    else
        echo "❌ globals.css 不存在"
    fi
    echo "⚙️  配置文件检查完成"
}

# 执行构建测试
test_build() {
    echo "🏗️  构建测试开始"
    if npm run build > build-test.log 2>&1; then
        echo "✅ 构建测试成功"
        # 显示构建结果摘要
        grep "Compiled successfully" build-test.log && echo "✅ 编译成功"
        grep "First Load JS" build-test.log || echo "⚠️  构建日志中未找到 First Load JS 信息"
    else
        echo "❌ 构建测试失败，请查看 build-test.log"
        cat build-test.log
    fi
    echo "🏗️  构建测试完成"
}

# 主函数
main() {
    echo "🚀 YYC 项目诊断脚本启动"
    check_system_health
    echo ""
    check_dependencies
    echo ""
    check_project_structure
    echo ""
    check_config_files
    echo ""
    test_build
    echo ""
    echo "🎉 诊断完成！系统运行正常！"
}

# 执行主函数
main