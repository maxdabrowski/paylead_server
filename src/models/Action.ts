export interface Action {
  _id?: any;
  lead_id: number;
  owner: string;
  area: string;
  region: string;
  status: string;
  date: any;
  note?: string;
  policy?: string;
  income?: number
}