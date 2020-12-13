export interface User {
  id: number;
  name: string;
  surname: string;
  nick: string;
  password?: string;
  region: string;
  area: string;
  role: string;
  phone: string;
  mail: string;
  active: boolean
}