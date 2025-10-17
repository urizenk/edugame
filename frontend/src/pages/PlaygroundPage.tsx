import { useEffect, useMemo, useState } from "react";
import { useRealtimeSync } from "../hooks/useRealtimeSync";

interface BubbleItem {
  id: string;
  text: string;
  color: string;
  createdAt: number;
}

const palette = [
  "#ff6b9d", "#ff8c5a", "#ffca4a", "#36f799", "#b588ff",
  "#ff8fb3", "#ffa87a", "#ffd670", "#5cffaf", "#c9a8ff"
];
const playfulShapes = ["🌟", "🍭", "🌈", "🧸", "🎈", "🍀", "🌸", "🎨", "🎪", "🎯"];

const pickColor = (seed: number) => palette[seed % palette.length];
const pickShape = (seed: number) => playfulShapes[seed % playfulShapes.length];

const PlaygroundPage = () => {
  // 使用实时同步 hook
  const {
    classBubbles,
    sortingBubbles,
    setClassBubbles,
    setSortingBubbles,
    isConnected,
    syncToServer
  } = useRealtimeSync();

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [textInput, setTextInput] = useState<string>("");

  const stats = useMemo(
    () => ({
      classCount: classBubbles.length,
      sortingCount: sortingBubbles.length
    }),
    [classBubbles.length, sortingBubbles.length]
  );

  // 当本地数据变化时，同步到服务器
  useEffect(() => {
    if (classBubbles.length > 0 || sortingBubbles.length > 0) {
      syncToServer({ classBubbles, sortingBubbles });
    }
  }, [classBubbles, sortingBubbles]);

  const createBubble = (text: string): BubbleItem => {
    const seed = Math.floor(Math.random() * 10_000);
    return {
      id: `${Date.now()}-${seed}`,
      text,
      color: pickColor(seed),
      createdAt: Date.now()
    };
  };

  const addToSorting = (bubbleId: string) => {
    setSortingBubbles((prev) => {
      if (prev.some((item) => item.id === bubbleId)) return prev;
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
    <div className="min-h-screen relative flex flex-col overflow-hidden bg-gradient-to-br from-sky-400 via-blue-400 to-blue-500">
      {/* 连接状态指示器 */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
        <span className="text-sm font-bold text-slate-700">
          {isConnected ? '实时同步中' : '未连接'}
        </span>
      </div>

      {/* 装饰元素 */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* 太阳 */}
        <div className="absolute top-12 left-20 w-40 h-40 bg-yellow-400 rounded-full shadow-2xl">
          <div className="absolute inset-6 bg-yellow-300 rounded-full flex items-center justify-center text-6xl">😊</div>
        </div>
        
        {/* 彩虹 */}
        <div className="absolute top-20 right-32 opacity-95">
          <svg width="400" height="200" viewBox="0 0 400 200">
            <path d="M 50 200 Q 200 0 350 200" fill="none" stroke="#ef4444" strokeWidth="25" />
            <path d="M 60 200 Q 200 20 340 200" fill="none" stroke="#f97316" strokeWidth="25" />
            <path d="M 70 200 Q 200 40 330 200" fill="none" stroke="#facc15" strokeWidth="25" />
            <path d="M 80 200 Q 200 60 320 200" fill="none" stroke="#22c55e" strokeWidth="25" />
            <path d="M 90 200 Q 200 80 310 200" fill="none" stroke="#3b82f6" strokeWidth="25" />
            <path d="M 100 200 Q 200 100 300 200" fill="none" stroke="#8b5cf6" strokeWidth="25" />
          </svg>
        </div>

        {/* 云朵 */}
        <div className="absolute top-40 right-1/4">
          <div className="relative">
            <div className="w-48 h-24 bg-white rounded-full opacity-95 shadow-2xl"></div>
            <div className="absolute top-4 left-8 w-40 h-20 bg-white rounded-full opacity-95 shadow-2xl"></div>
            <div className="absolute top-6 right-8 w-32 h-16 bg-white rounded-full opacity-95 shadow-2xl"></div>
          </div>
        </div>

        {/* 星星 */}
        <div className="absolute top-1/4 left-1/4 text-8xl animate-pulse">⭐</div>
        <div className="absolute bottom-1/3 left-1/3 text-7xl">✨</div>
        <div className="absolute top-1/3 right-1/4 text-8xl">💫</div>
      </div>

      {/* 彩旗 */}
      <div className="absolute top-0 left-0 right-0 h-20 flex justify-around items-start pointer-events-none z-10">
        {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19].map((i) => (
          <div key={i} className="relative">
            <div className="w-0.5 h-12 bg-white/40"></div>
            <div 
              className="absolute top-12 -left-4 w-8 h-10"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                backgroundColor: ['#ff6b6b', '#ffd93d', '#4ecdc4', '#95e1d3', '#f38181', '#aa96da'][i % 6]
              }}
            ></div>
          </div>
        ))}
      </div>

      {/* 标题 */}
      <header className="relative px-8 py-12 text-center z-20">
        <h1 className="text-7xl font-black text-white tracking-wide drop-shadow-2xl mb-4">
          趣味大搜集！
        </h1>
        <p className="text-2xl text-white/95 font-bold drop-shadow-lg">
          将创意气泡从集趣池拖拽到排序舞台，打造你的知识图谱
        </p>
      </header>

      {/* 主内容 - 调整比例：集趣池更大(flex-[3])，排序舞台更小(flex-1) */}
      <main className="flex-1 mx-auto w-full max-w-[1900px] px-8 pb-8">
        <div className="flex flex-col lg:flex-row gap-8 h-full">
          {/* 集趣池 - 增加宽度 flex-[3] */}
          <section className="flex-[3] rounded-[3rem] bg-white/95 backdrop-blur-xl p-8 shadow-2xl flex flex-col min-h-[600px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-4xl font-black text-blue-600">集趣池</h2>
              <span className="text-2xl text-blue-500 font-bold">{stats.classCount} 个气泡</span>
            </div>

            <div className="flex-1 flex flex-wrap content-start gap-4 p-6 overflow-y-auto bg-blue-50/50 rounded-3xl">
              {classBubbles.length === 0 ? (
                <div className="flex w-full flex-col items-center justify-center gap-8 text-blue-400">
                  <span className="text-9xl">💡</span>
                  <span className="font-bold text-3xl">还没有气泡，点击下方按钮创建</span>
                </div>
              ) : (
                classBubbles.map((bubble, index) => (
                  <div
                    key={bubble.id}
                    className={`group relative flex cursor-pointer select-none items-center gap-4 rounded-full px-12 py-6 text-3xl font-black text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:rotate-3 active:scale-95 ${
                      draggingId === bubble.id ? 'opacity-50 scale-90' : ''
                    }`}
                    style={{
                      backgroundColor: bubble.color,
                      backgroundImage: `linear-gradient(135deg, ${bubble.color} 0%, ${bubble.color}dd 100%)`,
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
                    <span className="absolute top-1 left-4 h-3 w-4 rounded-full bg-white/60 blur-sm" />
                    <button
                      type="button"
                      className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-red-500 text-white text-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 z-20"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeBubble(bubble.id);
                      }}
                    >
                      ×
                    </button>
                    <span className="text-4xl">{pickShape(index)}</span>
                    <span>{bubble.text}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* 排序舞台 - 保持宽度 flex-1 */}
          <section
            className={`flex-1 rounded-[3rem] backdrop-blur-xl p-8 shadow-2xl flex flex-col min-h-[600px] transition-all ${
              draggingId ? 'bg-green-100/95 scale-[1.02]' : 'bg-white/95'
            }`}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
            }}
            onDrop={(event) => {
              event.preventDefault();
              const bubbleId = event.dataTransfer.getData("application/bubble-id");
              if (bubbleId) handleDropToSorting(bubbleId);
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-4xl font-black text-purple-600">排序舞台</h2>
              <span className="text-2xl text-purple-500 font-bold">{stats.sortingCount} 个气泡</span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-purple-50/50 rounded-3xl p-6">
              {sortingBubbles.length === 0 ? (
                <div className="flex min-h-[500px] flex-col items-center justify-center gap-8 text-purple-400">
                  <span className="text-9xl">🎯</span>
                  <span className="font-bold text-2xl text-center">拖拽气泡到这里开始排序!</span>
                </div>
              ) : (
                sortingBubbles.map((bubble, index) => (
                  <div
                    key={bubble.id}
                    className="flex items-center justify-between gap-4 rounded-3xl bg-white px-5 py-3 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className="flex h-12 w-12 items-center justify-center rounded-full text-xl font-black text-white shadow-xl flex-shrink-0"
                        style={{
                          backgroundColor: bubble.color,
                          backgroundImage: `linear-gradient(135deg, ${bubble.color} 0%, ${bubble.color}dd 100%)`,
                        }}
                      >
                        {index + 1}
                      </span>
                      <p className="font-black text-slate-800 text-lg">{bubble.text}</p>
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <button
                        type="button"
                        className="rounded-full bg-blue-500 px-3 py-1.5 text-base font-bold text-white shadow-lg hover:bg-blue-600 hover:scale-110 disabled:opacity-40"
                        onClick={() => moveBubble(bubble.id, "up")}
                        disabled={index === 0}
                      >
                        ⬆️
                      </button>
                      <button
                        type="button"
                        className="rounded-full bg-blue-500 px-3 py-1.5 text-base font-bold text-white shadow-lg hover:bg-blue-600 hover:scale-110 disabled:opacity-40"
                        onClick={() => moveBubble(bubble.id, "down")}
                        disabled={index === sortingBubbles.length - 1}
                      >
                        ⬇️
                      </button>
                      <button
                        type="button"
                        className="rounded-full bg-red-500 px-3 py-1.5 text-base font-bold text-white shadow-lg hover:bg-red-600 hover:scale-110"
                        onClick={() => removeFromSorting(bubble.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>

      {/* 输入栏 */}
      <footer className="px-8 pb-8 z-20">
        <div className="mx-auto max-w-[1900px]">
          <div className="flex gap-6 items-center bg-blue-600 rounded-full px-10 py-6 shadow-2xl">
            <div className="flex items-center gap-4 text-white">
              <span className="text-4xl">✏️</span>
              <span className="text-2xl font-bold whitespace-nowrap">创建新气泡</span>
            </div>
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleTextSubmit();
              }}
              placeholder="直接输入文字创建气泡..."
              className="flex-1 rounded-full bg-white px-10 py-5 text-2xl font-bold text-slate-900 placeholder-slate-400 shadow-lg focus:outline-none focus:ring-4 focus:ring-white/50"
            />
            <button
              type="button"
              onClick={handleTextSubmit}
              disabled={!textInput.trim()}
              className="rounded-full bg-white px-14 py-5 text-2xl font-black text-blue-600 shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 whitespace-nowrap"
            >
              创建
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PlaygroundPage;
