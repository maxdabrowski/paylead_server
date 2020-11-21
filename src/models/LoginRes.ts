import { User } from './User';

export interface LoginRes{
  loginError:boolean;
  loginUser?: User
}
