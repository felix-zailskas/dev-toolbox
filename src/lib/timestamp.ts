export interface DateFields {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}

export interface DecodedTimestamp {
  iso8601: string;
  rfc2822: string;
  relative: string;
  local: string;
  utc: string;
  fields: DateFields;
}

/**
 * Timestamps with more than 10 digits are treated as milliseconds.
 */
export function isMilliseconds(input: string): boolean {
  return input.replace(/^-/, "").length > 10;
}

export function parseTimestamp(input: string): Date | null {
  const trimmed = input.trim();
  if (!/^-?\d+$/.test(trimmed)) return null;

  const num = Number(trimmed);
  const ms = isMilliseconds(trimmed) ? num : num * 1000;
  const date = new Date(ms);

  if (isNaN(date.getTime())) return null;

  // Reject dates outside a reasonable range (year 0 to year 9999)
  const year = date.getUTCFullYear();
  if (year < 0 || year > 9999) return null;

  return date;
}

export function formatISO(date: Date): string {
  return date.toISOString();
}

export function formatRFC2822(date: Date): string {
  // Date.toUTCString() returns RFC 7231 format which is close to RFC 2822
  // e.g. "Tue, 14 Apr 2026 12:30:00 GMT"
  return date.toUTCString();
}

export function formatRelative(date: Date): string {
  const now = Date.now();
  const diffMs = date.getTime() - now;
  const absDiffMs = Math.abs(diffMs);
  const isFuture = diffMs > 0;

  const seconds = Math.floor(absDiffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  let label: string;
  if (seconds < 60) label = `${seconds} second${seconds !== 1 ? "s" : ""}`;
  else if (minutes < 60) label = `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  else if (hours < 24) label = `${hours} hour${hours !== 1 ? "s" : ""}`;
  else if (days < 30) label = `${days} day${days !== 1 ? "s" : ""}`;
  else if (months < 12) label = `${months} month${months !== 1 ? "s" : ""}`;
  else label = `${years} year${years !== 1 ? "s" : ""}`;

  return isFuture ? `in ${label}` : `${label} ago`;
}

export function formatLocal(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
    timeZoneName: "short",
  } as Intl.DateTimeFormatOptions).format(date);
}

export function formatUTC(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
    timeZoneName: "short",
    timeZone: "UTC",
  } as Intl.DateTimeFormatOptions).format(date);
}

export function decodeTimestamp(input: string): DecodedTimestamp | { error: string } {
  const date = parseTimestamp(input);
  if (!date) {
    return { error: "Invalid timestamp: enter a numeric unix timestamp" };
  }
  return {
    iso8601: formatISO(date),
    rfc2822: formatRFC2822(date),
    relative: formatRelative(date),
    local: formatLocal(date),
    utc: formatUTC(date),
    fields: dateToFields(date),
  };
}

export function daysInMonth(year: number, month: number): number {
  // month is 1-based, Date constructor expects 0-based
  // Day 0 of the next month gives the last day of the current month
  return new Date(year, month, 0).getDate();
}

export function dateToFields(date: Date): DateFields {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
    millisecond: date.getMilliseconds(),
  };
}

export function nowFields(): DateFields {
  return dateToFields(new Date());
}

export function encodeTimestamp(fields: DateFields): { seconds: number; milliseconds: number; utc: string } {
  const date = new Date(
    fields.year,
    fields.month - 1,
    fields.day,
    fields.hour,
    fields.minute,
    fields.second,
    fields.millisecond,
  );
  const ms = date.getTime();
  return {
    seconds: Math.floor(ms / 1000),
    milliseconds: ms,
    utc: formatUTC(date),
  };
}

export function validateField(field: keyof DateFields, value: number, fields: DateFields): string | null {
  switch (field) {
    case "year":
      if (value < 0 || value > 9999) return "Year must be 0-9999";
      return null;
    case "month":
      if (value < 1 || value > 12) return "Month must be 1-12";
      return null;
    case "day": {
      const maxDay = daysInMonth(fields.year, fields.month);
      if (value < 1 || value > maxDay) return `Day must be 1-${maxDay}`;
      return null;
    }
    case "hour":
      if (value < 0 || value > 23) return "Hour must be 0-23";
      return null;
    case "minute":
      if (value < 0 || value > 59) return "Minute must be 0-59";
      return null;
    case "second":
      if (value < 0 || value > 59) return "Second must be 0-59";
      return null;
    case "millisecond":
      if (value < 0 || value > 999) return "Millisecond must be 0-999";
      return null;
  }
}
