import { format, formatDistanceToNow } from "date-fns";

export const formatTimestamp = (iso: string) =>
  format(new Date(iso), "MMM d, yyyy h:mm a");

export const formatDate = (iso: string) =>
  format(new Date(iso), "MMM d, yyyy");

export const formatRelative = (iso: string) =>
  formatDistanceToNow(new Date(iso), { addSuffix: true });

export const nowISO = () => new Date().toISOString();
