# 前端应用（Voice Bubble Playground）

语音词云教学平台的前端体验已聚焦为“老师单角色”的课堂互动面板：孩子对着一体机说话生成彩色气泡，老师把气泡挑选到排序区进行讨论或投票。界面采用明亮活泼的配色，适合学前教育场景。

## 快速开始

```bash
npm install
cp .env.example .env    # 如需调整后端地址
npm run dev
```

默认访问地址 `http://localhost:5173`。请确保后端运行在 `http://localhost:4000` 并已配置百度语音识别密钥。

## 功能概览

- **语音气泡生成**：点击“语音输入”按钮开始/结束录音，系统会调用后端语音识别接口，自动生成彩色气泡并放入“灵感池”。
- **灵感池**：集中展示所有语音内容，支持点击或拖拽把气泡加入右侧“排序舞台”。
- **排序舞台**：用于课堂总结或投票，气泡可上下调整顺序，也可移除重新挑选。
- **触控/大屏友好**：按钮与卡片留有充足的触控空间，适合一体机操作。

## 项目结构

- `src/pages/PlaygroundPage.tsx`：核心页面布局与互动逻辑。
- `src/components/input/VoiceRecorder.tsx`：语音录制与识别组件。
- `src/services/speech.ts` / `src/services/api.ts`：与后端语音接口交互。
- `src/index.css` / `tailwind.config.js`：渐变背景、品牌色等视觉配置。

## 自定义建议

- 调整 `palette` / `playfulShapes` 以适配不同班级主题。
- 如需保存排序结果，可在 `sortingBubbles` 状态上增加导出或持久化逻辑。
- 若需替换语音服务，只需修改 `services/speech.ts` 与后端对应实现。

希望你在课堂上玩得开心，也欢迎继续扩展更多互动玩法！
