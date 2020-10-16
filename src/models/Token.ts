export type TokenType = 'Root' | 'Admin' | 'User';

export interface Token {
  id: number;
  permission: TokenType;
  token: string;
  userId: number;
  retired: boolean;
}