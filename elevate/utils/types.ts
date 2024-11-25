export type User = {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  createdAt: Date;
  completed: boolean;
};
