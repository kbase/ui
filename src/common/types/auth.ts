/* types/auth */
export interface Me {
  anonid: string;
  created: number;
  customroles: string[];
  display: string;
  email: string;
  idents: Record<string, string>[];
  lastlogin: number;
  local: boolean;
  policyids: Record<string, string | number>[];
  roles: Record<string, string>[];
  user: string;
}
