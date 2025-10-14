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

      {/* 简化的顶部标题栏 */}
      <header className="relative overflow-hidden bg-white/80 backdrop-blur-xl px-6 py-8 shadow-sm border-b border-playful-peach-200/30">
        {/* 装饰性表情符号 */}

        {/* 装饰性表情符号 */}
        <div className="absolute left-6 top-2 text-4xl animate-bounce-gentle" aria-hidden="true">🎠</div>
        <div className="absolute right-16 top-3 text-3xl animate-float" aria-hidden="true">🎨</div>

        <div className="relative mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-playful-peach-700 md:text-3xl">
              快乐课堂 · 语音创想
            </h1>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-2 rounded-full bg-playful-honey-100 px-4 py-2 shadow-sm border border-playful-honey-300/40">
              🌟 <strong className="text-playful-coral-700">{stats.classCount}</strong>
            </span>
            <span className="flex items-center gap-2 rounded-full bg-playful-lavender-100 px-4 py-2 shadow-sm border border-playful-lavender-300/40">
              🪄 <strong className="text-playful-lavender-700">{stats.sortingCount}</strong>
            </span>
          </div>
        </div>
      </header>

      {/* 主要内容区：两个池子水平平齐 */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-8 md:px-12">
        <div className="flex flex-col md:flex-row gap-8 h-full">
          {/* 左侧：集趣池 */}
          <section className="flex-1 rounded-3xl bg-white/95 border-4 border-playful-peach-200/50 p-8 shadow-xl backdrop-blur-xl flex flex-col">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="text-3xl animate-bounce-gentle" aria-hidden="true">🫧</span>
              <h2 className="text-2xl font-bold text-playful-peach-700">集趣池</h2>
              <span className="text-3xl animate-bounce-gentle" aria-hidden="true">✨</span>
            </div>

            <div className="flex-1 flex min-h-[400px] flex-wrap content-start gap-3 rounded-3xl border-2 border-dashed border-playful-honey-300/40 bg-playful-honey-50/30 p-5 overflow-y-auto">
              {classBubbles.length === 0 ? (
                <div className="flex w-full flex-col items-center justify-center gap-3 text-sm text-ink-500">
                  <span className="text-5xl animate-bounce-gentle" aria-hidden="true">🎤</span>
                  <span className="font-medium">等待孩子们的第一句灵感~</span>
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
                      className={`group relative flex cursor-pointer select-none items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:rotate-2 hover:z-10 active:scale-95 animate-bubble-bounce-in bubble-hover-glow ${floatAnimation} ${draggingId === bubble.id ? 'opacity-50 scale-90 cursor-grabbing bubble-dragging' : 'cursor-grab'
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

                      {/* 删除按钮 */}
                      <button
                        type="button"
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 hover:scale-110 z-20"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBubble(bubble.id);
                        }}
                      >
                        ×
                      </button>

                      <span className="text-base animate-bounce-gentle" aria-hidden="true" style={{ animationDelay: `${(index % 3) * 0.3}s` }}>
                        {pickShape(index)}
                      </span>
                      <span className="relative z-10">{bubble.text}</span>
                      <span className="ml-1 rounded-full bg-white/40 px-2.5 py-0.5 text-[11px] font-semibold text-white opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:bg-white/60">
                        加入排序区
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* 右侧：排序舞台 */}
          <section
            className={`flex-1 rounded-3xl border-4 transition-all duration-300 p-8 backdrop-blur-xl flex flex-col ${draggingId
              ? 'border-playful-mint-400 bg-playful-mint-50/30 shadow-xl scale-[1.02]'
              : 'border-playful-lavender-200/50 bg-white/95 shadow-lg'
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
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="text-3xl animate-float" aria-hidden="true">🎪</span>
              <h2 className="text-2xl font-bold text-playful-lavender-700">排序舞台</h2>
              <span className="text-3xl animate-float" aria-hidden="true">🎯</span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto">
              {sortingBubbles.length === 0 ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-playful-lavender-300/40 bg-playful-lavender-50/20 text-sm text-ink-500">
                  <span className="text-5xl animate-bounce-gentle" aria-hidden="true">🧠</span>
                  <span className="font-medium text-center px-4">拖拽气泡到这里开始排序!</span>
                </div>
              ) : (
                sortingBubbles.map((bubble, index) => (
                  <div
                    key={bubble.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border-2 border-playful-lavender-200 bg-white px-5 py-4 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-bubble-pop-in hover:border-playful-lavender-400"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold shadow-lg relative overflow-hidden animate-bubble-pulse"
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
                        <p className="font-bold text-ink-800 text-base">{bubble.text}</p>
                        <p className="text-xs text-ink-500 mt-0.5 flex items-center gap-1">
                          <span className="animate-pulse">⏰</span>
                          {new Date(bubble.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="rounded-full bg-playful-mint-100 px-3 py-2 text-xs font-bold text-playful-mint-700 shadow-sm transition-all duration-200 hover:bg-playful-mint-200 hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                        onClick={() => moveBubble(bubble.id, "up")}
                        disabled={index === 0}
                      >
                        ⬆️
                      </button>
                      <button
                        type="button"
                        className="rounded-full bg-playful-honey-100 px-3 py-2 text-xs font-bold text-playful-honey-700 shadow-sm transition-all duration-200 hover:bg-playful-honey-200 hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                        onClick={() => moveBubble(bubble.id, "down")}
                        disabled={index === sortingBubbles.length - 1}
                      >
                        ⬇️
                      </button>
                      <button
                        type="button"
                        className="rounded-full bg-playful-coral-100 px-3 py-2 text-xs font-bold text-playful-coral-700 shadow-sm transition-all duration-200 hover:bg-playful-coral-200 hover:scale-110 active:scale-95"
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

      {/* 底部：输入区域 */}
      <footer className="border-t border-playful-peach-200/30 bg-white/90 backdrop-blur-xl px-6 py-6 shadow-lg">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
            {/* 语音输入 */}
            <div className="flex-1">
              <VoiceRecorder onTranscript={handleTranscript} />
            </div>

            {/* 文字输入 */}
            <div className="flex-1 flex gap-3">
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
                className="flex-1 rounded-2xl border-2 border-playful-lavender-300/40 bg-white px-5 py-4 text-base font-medium text-ink-900 placeholder-ink-400 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-playful-lavender-300/50 focus:border-playful-lavender-400"
              />
              <button
                type="button"
                onClick={handleTextSubmit}
                disabled={!textInput.trim()}
                className="rounded-2xl bg-playful-lavender-500 px-8 py-4 text-base font-bold text-white shadow-md transition-all duration-200 hover:bg-playful-lavender-400 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span className="flex items-center gap-2">
                  <span>✨</span>
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
