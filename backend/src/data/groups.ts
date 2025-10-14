export interface GroupAccount {
  id: string;
  name: string;
  username: string;
  password: string;
}

export const ADMIN_ACCOUNT = {
  id: 'teacher-admin',
  username: 'admin',
  password: 'admin123',
  role: 'teacher' as const
};

export const GROUP_ACCOUNTS: GroupAccount[] = Array.from({ length: 9 }).map((_, index) => {
  const number = index + 1;
  return {
    id: `group${number}`,
    name: `小组${number}`,
    username: `group${number}`,
    password: '123456'
  };
});

export const findGroupById = (groupId: string) =>
  GROUP_ACCOUNTS.find((group) => group.id === groupId || group.username === groupId);
