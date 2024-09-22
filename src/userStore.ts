// userStore.ts
const users = [
  {
    lineUserId: "U13e6d5f39bb37522c52fd8c31bd512d4",
    username: "10210422002",
    password: "EahWMiro",
  },
];

export const getUserCredentials = (lineUserId: string) => {
  const user = users.find((u) => u.lineUserId === lineUserId);
  if (user) {
    return { username: user.username, password: user.password };
  }
  return null;
};
