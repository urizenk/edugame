import { Router } from 'express';

const router = Router();

// 内存存储（简单实现，生产环境应使用数据库）
export interface BubbleItem {
  id: string;
  text: string;
  color: string;
  createdAt: number;
}

export interface BubbleData {
  classBubbles: BubbleItem[];
  sortingBubbles: BubbleItem[];
}

// 全局数据存储
export let bubbleData: BubbleData = {
  classBubbles: [],
  sortingBubbles: []
};

// 更新数据的辅助函数（用于Socket.IO和HTTP）
export const updateBubbleData = (newData: BubbleData): BubbleData => {
  bubbleData = {
    classBubbles: newData.classBubbles || [],
    sortingBubbles: newData.sortingBubbles || []
  };
  return bubbleData;
};

// 获取所有气泡数据
router.get('/data', (_req, res) => {
  res.json(bubbleData);
});

// 更新所有气泡数据（通过HTTP）
router.post('/data', (req, res) => {
  const { classBubbles, sortingBubbles } = req.body;
  
  if (!Array.isArray(classBubbles) || !Array.isArray(sortingBubbles)) {
    return res.status(400).json({ message: '数据格式错误' });
  }

  const updated = updateBubbleData({ classBubbles, sortingBubbles });
  res.json({ message: '数据更新成功', data: updated });
});

// 清空所有数据
router.post('/clear', (_req, res) => {
  bubbleData = {
    classBubbles: [],
    sortingBubbles: []
  };
  res.json({ message: '数据已清空', data: bubbleData });
});

export default router;

