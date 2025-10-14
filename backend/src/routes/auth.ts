import { Router } from 'express';
import env from '../config/env';
import { ADMIN_ACCOUNT, GROUP_ACCOUNTS, findGroupById } from '../data/groups';
import { authenticate } from '../middleware/auth';
import { signToken } from '../utils/jwt';

const router = Router();

router.post('/login', (req, res) => {
  const { role, username, password, groupId } = req.body ?? {};

  if (!role || !password) {
    return res.status(400).json({ message: '缺少必要的登录信息。' });
  }

  if (role === 'teacher') {
    const teacherUsername = username ?? ADMIN_ACCOUNT.username;
    if (teacherUsername !== ADMIN_ACCOUNT.username || password !== (env.adminPassword || ADMIN_ACCOUNT.password)) {
      return res.status(401).json({ message: '账号或密码错误。' });
    }

    const token = signToken({ sub: ADMIN_ACCOUNT.id, role: 'teacher' });
    return res.json({
      token,
      user: {
        id: ADMIN_ACCOUNT.id,
        role: 'teacher' as const,
        username: ADMIN_ACCOUNT.username
      }
    });
  }

  if (role === 'student') {
    const targetGroupId = groupId ?? username;
    const group = targetGroupId ? findGroupById(targetGroupId) : undefined;

    if (!group || password !== group.password) {
      return res.status(401).json({ message: '小组账号或密码错误。' });
    }

    const token = signToken({ sub: group.id, role: 'student' });
    return res.json({
      token,
      user: {
        id: `${group.id}-member`,
        role: 'student' as const,
        groupId: group.id,
        groupName: group.name,
        username: group.username
      }
    });
  }

  return res.status(400).json({ message: '不支持的角色类型。' });
});

router.get('/profile', authenticate, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: '未授权访问。' });
  }

  if (req.user.role === 'teacher') {
    return res.json({
      id: ADMIN_ACCOUNT.id,
      role: 'teacher' as const,
      username: ADMIN_ACCOUNT.username
    });
  }

  const group = findGroupById(req.user.id);
  if (!group) {
    return res.status(404).json({ message: '找不到对应的小组信息。' });
  }

  return res.json({
    id: `${group.id}-member`,
    role: 'student' as const,
    groupId: group.id,
    groupName: group.name,
    username: group.username
  });
});

router.get('/groups', (_req, res) => {
  res.json(
    GROUP_ACCOUNTS.map((group) => ({
      id: group.id,
      name: group.name,
      username: group.username
    }))
  );
});

export default router;
