export interface User {
  id: string;
  name?: string;
  email?: string;
  emailVerified?: Date;
  image?: string;
  accounts: Account[];
  devices: Device[];
}

export interface Account {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
}

export interface Device {
  id: string;
  userId: string;
  subscription: Record<string, unknown>;
  platform: string;
  osVersion: string;
  dateAdded: Date;
  createdAt: Date;
  updatedAt: Date;
  user: User;
}
