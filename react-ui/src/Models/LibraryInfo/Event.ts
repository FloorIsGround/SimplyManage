export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string
  location: string;
  starttime: string; // e.g. "14:00"
  endtime: string; // e.g. "16:00"
}
