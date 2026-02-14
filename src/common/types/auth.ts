/* types/auth */
export type MfaStatus = 'Used' | 'NotUsed' | 'Unknown';

export interface Me {
  anonid: string;
  created: number;
  customroles: string[];
  display: string;
  email: string;
  idents: Record<string, string>[];
  lastlogin: number;
  local: boolean;
  policyids: { id: string; agreedon: number }[];
  roles: Record<string, string>[];
  user: string;
}
