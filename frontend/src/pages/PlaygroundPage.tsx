import { useMemo, useState } from "react";
import VoiceRecorder from "../components/input/VoiceRecorder";

interface BubbleItem {
  id: string;
  text: string;
  color: string;
  createdAt: number;
}

const palette = [
  "#ff6b9d", // playful-peach-500 桃粉
  "#ff8c5a", // playful-coral-500 珊瑚
  "#ffca4a", // playful-honey-500 蜜桃黄
  "#36f799", // playful-mint-500 薄荷绿
  "#b588ff", // playful-lavender-500 薰衣草紫
  "#ff8fb3", // playful-peach-400 浅桃粉
  "#ffa87a", // playful-coral-400 浅珊瑚
  "#ffd670", // playful-honey-400 浅蜜桃黄
  "#5cffaf", // playful-mint-400 浅薄荷绿
  "#c9a8ff"  // playful-lavender-400 浅薰衣草
];
const playfulShapes = ["🌟", "🍭", "🌈", "🧸", "🎈", "🍀", "🌸", "🎨", "🎪", "🎯", "🌺", "🦋", "🐝", "🌻"];

const pickColor = (seed: number) => palette[seed % palette.length];
const pickShape = (seed: number) => playfulShapes[seed % playfulShapes.length];

const PlaygroundPage = () => {
  const [classBubbles, setClassBubbles] = useState<BubbleItem[]>([]);
  const [sortingBubbles, setSortingBubbles] = useState<BubbleItem[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [textInput, setTextInput] = useState<string>("");

  const stats = useMemo(
    () => ({
      classCount: classBubbles.length,
      sortingCount: sortingBubbles.length
    }),
    [classBubbles.length, sortingBubbles.length]
  );

  const createBubble = (text: string): BubbleItem => {
    const seed = Math.floor(Math.random() * 10_000);
    return {
      id: `${Date.now()}-${seed}`,
      text,
      color: pickColor(seed),
      createdAt: Date.now()
    };
  };

  const handleTranscript = (text: string) => {
    if (!text.trim()) return;
    const newBubble = createBubble(text.trim());
    setClassBubbles((prev) => [newBubble, ...prev]);
  };

  const addToSorting = (bubbleId: string) => {
    setSortingBubbles((prev) => {
      if (prev.some((item) => item.id === bubbleId)) {
        return prev;
      }
      const found = classBubbles.find((item) => item.id === bubbleId);
      return found ? [...prev, found] : prev;
    });
  };

  const removeFromSorting = (bubbleId: string) => {
    setSortingBubbles((prev) => prev.filter((item) => item.id !== bubbleId));
  };

  const removeBubble = (bubbleId: string) => {
    setClassBubbles((prev) => prev.filter((item) => item.id !== bubbleId));
    setSortingBubbles((prev) => prev.filter((item) => item.id !== bubbleId));
  };

  const moveBubble = (bubbleId: string, direction: "up" | "down") => {
    setSortingBubbles((prev) => {
      const index = prev.findIndex((item) => item.id === bubbleId);
      if (index === -1) return prev;
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(index, 1);
      updated.splice(targetIndex, 0, moved);
      return updated;
    });
  };

  const handleDropToSorting = (bubbleId: string) => {
    addToSorting(bubbleId);
    setDraggingId(null);
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) return;
    const newBubble = createBubble(textInput.trim());
    setClassBubbles((prev) => [newBubble, ...prev]);
    setTextInput("");
  };

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden">
      {/* 流动背景层 - 模糊色彩效果 */}
      <div className="fixed inset-0 -z-10 bg-blue-50">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-playful-peach-300/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-playful-honey-300/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-playful-coral-300/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-playful-lavender-300/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-6000" />
        <div className="absolute top-1/3 left-1/2 w-80 h-80 bg-playful-mint-300/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-8000" />
      </div>

      {/* 顶部标题栏 - 海洋蓝色系，增大尺寸 */}
      <header className="relative overflow-hidden bg-gradient-to-r from-sky-100/90 to-blue-100/90 backdrop-blur-xl px-8 py-10 shadow-lg border-b border-sky-300/40">
        {/* 装饰性海洋表情符号 */}
        <div className="absolute left-8 top-3 text-5xl animate-bounce-gentle" aria-hidden="true">🐠</div>
        <div className="absolute right-20 top-4 text-4xl animate-float" aria-hidden="true">🌊</div>

        <div className="relative mx-auto flex max-w-[1800px] items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-sky-700 md:text-4xl tracking-wide">
              快乐课堂 · 语音创想
            </h1>
            <p className="text-lg text-blue-600 mt-2 font-medium">海洋主题教学互动平台</p>
          </div>
          <div className="flex gap-6 text-base">
            <span className="flex items-center gap-3 rounded-full bg-cyan-100 px-6 py-3 shadow-md border border-cyan-300/50">
              🐚 <strong className="text-cyan-700 text-lg">{stats.classCount}</strong>
              <span className="text-cyan-600 text-sm">个想法</span>
            </span>
            <span className="flex items-center gap-3 rounded-full bg-blue-100 px-6 py-3 shadow-md border border-blue-300/50">
              🦑 <strong className="text-blue-700 text-lg">{stats.sortingCount}</strong>
              <span className="text-blue-600 text-sm">已排序</span>
            </span>
          </div>
        </div>
      </header>

      {/* 主要内容区：两个池子水平平齐 - 针对希沃教学一体机优化 */}
      <main className="flex-1 mx-auto w-full max-w-[1800px] px-8 py-12 md:px-16">
        <div className="flex flex-col lg:flex-row gap-12 h-full min-h-[700px]">
          {/* 左侧：集趣池 - 海洋蓝色系，增大尺寸 */}
          <section className="flex-1 rounded-[2rem] bg-gradient-to-br from-sky-50/95 to-blue-50/95 border-4 border-sky-300/60 p-12 shadow-2xl backdrop-blur-xl flex flex-col min-h-[650px]">
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className="text-5xl animate-bounce-gentle" aria-hidden="true">🌊</span>
              <h2 className="text-4xl font-bold text-sky-700 tracking-wide">集趣池</h2>
              <span className="text-5xl animate-bounce-gentle" aria-hidden="true">🐚</span>
            </div>

            <div className="flex-1 flex min-h-[500px] flex-wrap content-start gap-4 rounded-[2rem] border-3 border-dashed border-cyan-400/50 bg-gradient-to-br from-cyan-50/40 to-sky-100/40 p-8 overflow-y-auto shadow-inner">
              {classBubbles.length === 0 ? (
                <div className="flex w-full flex-col items-center justify-center gap-6 text-lg text-slate-600">
                  <span className="text-8xl animate-bounce-gentle" aria-hidden="true">🎤</span>
                  <span className="font-semibold text-xl">等待孩子们的第一句灵感~</span>
                  <div className="flex gap-3 text-6xl animate-pulse">
                    <span>🐠</span>
                    <span>🐙</span>
                    <span>🦑</span>
                  </div>
                </div>
              ) : (
                classBubbles.map((bubble, index) => {
                  // 为每个气泡随机分配不同的浮动动画
                  const floatAnimations = ['animate-bubble-float-1', 'animate-bubble-float-2', 'animate-bubble-float-3'];
                  const floatAnimation = floatAnimations[index % 3];
                  // 添加随机延迟使动画更自然
                  const animationDelay = `${(index % 5) * 0.2}s`;

                  return (
                    <div
                      key={bubble.id}
                      className={`group relative flex cursor-pointer select-none items-center gap-3 rounded-full px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:rotate-2 hover:z-10 active:scale-95 animate-bubble-bounce-in bubble-hover-glow ${floatAnimation} ${draggingId === bubble.id ? 'opacity-50 scale-90 cursor-grabbing bubble-dragging' : 'cursor-grab'
                        }`}
                      style={{
                        backgroundColor: bubble.color,
                        animationDelay: animationDelay,
                        backgroundImage: `linear-gradient(135deg, ${bubble.color} 0%, ${bubble.color}dd 100%)`,
                        boxShadow: draggingId === bubble.id
                          ? `0 4px 10px ${bubble.color}30, inset 0 1px 0 rgba(255,255,255,0.2)`
                          : `0 8px 20px ${bubble.color}40, inset 0 1px 0 rgba(255,255,255,0.3)`
                      }}
                      draggable
                      onDragStart={(event) => {
                        setDraggingId(bubble.id);
                        event.dataTransfer.setData("application/bubble-id", bubble.id);
                        event.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnd={() => setDraggingId(null)}
                      onClick={() => addToSorting(bubble.id)}
                    >
                      {/* 气泡高光效果 */}
                      <span
                        className="absolute top-1 left-3 h-2 w-3 rounded-full bg-white/60 blur-sm pointer-events-none"
                        aria-hidden="true"
                      />

                      {/* 删除按钮 - 增大尺寸 */}
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white text-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 hover:scale-110 z-20 shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBubble(bubble.id);
                        }}
                      >
                        ×
                      </button>

                      <span className="text-2xl animate-bounce-gentle" aria-hidden="true" style={{ animationDelay: `${(index % 3) * 0.3}s` }}>
                        {pickShape(index)}
                      </span>
                      <span className="relative z-10 text-lg">{bubble.text}</span>
                      <span className="ml-2 rounded-full bg-white/40 px-4 py-1.5 text-sm font-semibold text-white opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:bg-white/60">
                        加入排序区
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* 右侧：排序舞台 - 海洋蓝色系，增大尺寸 */}
          <section
            className={`flex-1 rounded-[2rem] border-4 transition-all duration-300 p-12 backdrop-blur-xl flex flex-col min-h-[650px] ${draggingId
              ? 'border-teal-400 bg-gradient-to-br from-teal-50/40 to-cyan-50/40 shadow-2xl scale-[1.02]'
              : 'border-blue-300/60 bg-gradient-to-br from-blue-50/95 to-indigo-50/95 shadow-xl'
              }`}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
            }}
            onDrop={(event) => {
              event.preventDefault();
              const bubbleId = event.dataTransfer.getData("application/bubble-id");
              if (bubbleId) {
                handleDropToSorting(bubbleId);
              }
            }}
          >
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className="text-5xl animate-float" aria-hidden="true">🏖️</span>
              <h2 className="text-4xl font-bold text-blue-700 tracking-wide">排序舞台</h2>
              <span className="text-5xl animate-float" aria-hidden="true">🌊</span>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto">
              {sortingBubbles.length === 0 ? (
                <div className="flex min-h-[500px] flex-col items-center justify-center gap-6 rounded-[2rem] border-3 border-dashed border-blue-400/50 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 text-lg text-slate-600 shadow-inner">
                  <span className="text-8xl animate-bounce-gentle" aria-hidden="true">🧠</span>
                  <span className="font-semibold text-xl text-center px-6">拖拽气泡到这里开始排序!</span>
                  <div className="flex gap-3 text-6xl animate-pulse">
                    <span>🐋</span>
                    <span>🦈</span>
                    <span>🐬</span>
                  </div>
                </div>
              ) : (
                sortingBubbles.map((bubble, index) => (
                  <div
                    key={bubble.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border-3 border-blue-200/60 bg-gradient-to-r from-white to-blue-50/50 px-8 py-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] animate-bubble-pop-in hover:border-blue-400/80"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className="mt-1 flex h-14 w-14 items-center justify-center rounded-full text-2xl font-bold shadow-xl relative overflow-hidden animate-bubble-pulse"
                        style={{
                          backgroundColor: bubble.color,
                          color: '#fff',
                          backgroundImage: `linear-gradient(135deg, ${bubble.color} 0%, ${bubble.color}dd 100%)`,
                          animationDelay: `${index * 0.2}s`
                        }}
                        aria-hidden="true"
                      >
                        {/* 数字高光效果 */}
                        <span className="absolute top-0 left-0 h-full w-full bg-gradient-to-br from-white/30 to-transparent rounded-full pointer-events-none" />
                        <span className="relative z-10">{index + 1}</span>
                      </span>
                      <div className="flex-1">
                        <p className="font-bold text-slate-800 text-xl leading-relaxed">{bubble.text}</p>
                        <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                          <span className="animate-pulse">⏰</span>
                          {new Date(bubble.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="rounded-full bg-teal-100 px-4 py-3 text-sm font-bold text-teal-700 shadow-md transition-all duration-200 hover:bg-teal-200 hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                        onClick={() => moveBubble(bubble.id, "up")}
                        disabled={index === 0}
                      >
                        ⬆️
                      </button>
                      <button
                        type="button"
                        className="rounded-full bg-cyan-100 px-4 py-3 text-sm font-bold text-cyan-700 shadow-md transition-all duration-200 hover:bg-cyan-200 hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                        onClick={() => moveBubble(bubble.id, "down")}
                        disabled={index === sortingBubbles.length - 1}
                      >
                        ⬇️
                      </button>
                      <button
                        type="button"
                        className="rounded-full bg-red-100 px-4 py-3 text-sm font-bold text-red-700 shadow-md transition-all duration-200 hover:bg-red-200 hover:scale-110 active:scale-95"
                        onClick={() => removeFromSorting(bubble.id)}
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>

      {/* 底部：输入区域 - 海洋蓝色系，增大尺寸 */}
      <footer className="border-t border-sky-300/40 bg-gradient-to-r from-sky-50/95 to-blue-50/95 backdrop-blur-xl px-8 py-8 shadow-xl">
        <div className="mx-auto max-w-[1800px]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
            {/* 语音输入 */}
            <div className="flex-1">
              <VoiceRecorder onTranscript={handleTranscript} />
            </div>

            {/* 文字输入 */}
            <div className="flex-1 flex gap-4">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleTextSubmit();
                  }
                }}
                placeholder="也可以直接输入文字创建气泡..."
                className="flex-1 rounded-2xl border-3 border-blue-300/50 bg-white px-6 py-5 text-lg font-medium text-slate-900 placeholder-slate-400 shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleTextSubmit}
                disabled={!textInput.trim()}
                className="rounded-2xl bg-blue-500 px-10 py-5 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:bg-blue-400 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span className="flex items-center gap-3">
                  <span className="text-xl">🌊</span>
                  <span>创建</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PlaygroundPage;
