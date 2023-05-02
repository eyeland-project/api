import { Role } from "@interfaces/enums/role.enum";

export interface LoginDto {
  token: string;
}

export interface TokenPayload {
  id: number;
  role: Role;
  iat?: number;
  exp?: number;
}
