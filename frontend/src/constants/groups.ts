export interface GroupInfo {
  id: string;
  name: string;
  username: string;
}

export const BUILT_IN_GROUPS: GroupInfo[] = Array.from({ length: 9 }).map((_, index) => {
  const number = index + 1;
  return {
    id: `group${number}`,
    name: `小组${number}`,
    username: `group${number}`
  };
});
