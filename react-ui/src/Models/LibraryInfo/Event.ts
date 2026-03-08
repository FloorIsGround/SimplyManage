export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string
  location: string;
  startTime: string; // e.g. "14:00"
  endTime: string; // e.g. "16:00"
}
