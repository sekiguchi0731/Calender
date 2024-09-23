// userStore.ts
const users = [
];

export const getUserCredentials = (lineUserId: string) => {
  const user = users.find((u) => u.lineUserId === lineUserId);
  if (user) {
    return { username: user.username, password: user.password };
  }
  return null;
};
