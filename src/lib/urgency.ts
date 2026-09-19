import { Reminder } from '../types';

export interface UrgencyEvaluation {
  isUrgent: boolean;
  level: 'critical' | 'high' | 'normal';
  badgeText: string;
  diffMinutes: number | null;
  countdownText: string;
  isOverdue: boolean;
  reason: 'imminent' | 'overdue' | 'relative' | 'keyword' | 'explicit' | 'none';
}

/**
 * Parses time strings and detects urgency:
 * - Imminent reminders due in <= 60 minutes
 * - Overdue reminders from today within 3 hours
 * - Explicit relative times ("in 15m", "10 mins")
 * - Immediate triggers ("now", "urgent", "asap")
 * - Explicit keyword triggers in title
 */
export function evaluateReminderUrgency(
  reminder: Reminder,
  currentTime: Date = new Date()
): UrgencyEvaluation {
  // Completed reminders are never urgent
  if (reminder.completed) {
    return {
      isUrgent: false,
      level: 'normal',
      badgeText: '',
      diffMinutes: null,
      countdownText: '',
      isOverdue: false,
      reason: 'none',
    };
  }

  // Explicit flag override
  if (reminder.isUrgent === true || reminder.priority === 'urgent') {
    return {
      isUrgent: true,
      level: 'critical',
      badgeText: 'PRIORITY URGENT',
      diffMinutes: 0,
      countdownText: 'High Priority',
      isOverdue: false,
      reason: 'explicit',
    };
  }

  const timeStr = (reminder.time || '').trim().toLowerCase();
  const titleStr = (reminder.title || '').trim().toLowerCase();

  // Explicit urgent markers in title
  const hasUrgentTitleKeyword =
    titleStr.includes('urgent') ||
    titleStr.includes('asap') ||
    titleStr.includes('emergency') ||
    titleStr.includes('critical') ||
    titleStr.includes('high priority') ||
    titleStr.includes('priority: 1') ||
    titleStr.includes('तुरंत') ||
    titleStr.includes('जरूरी');

  // Immediate time triggers
  if (
    timeStr.includes('now') ||
    timeStr.includes('immediately') ||
    timeStr.includes('asap') ||
    timeStr.includes('urgent') ||
    timeStr.includes('अभी') ||
    timeStr.includes('तुरंत')
  ) {
    return {
      isUrgent: true,
      level: 'critical',
      badgeText: 'DUE NOW',
      diffMinutes: 0,
      countdownText: 'Due Right Now',
      isOverdue: false,
      reason: 'imminent',
    };
  }

  // Relative minutes match: "in 15m", "15m", "30 mins", "in 45 minutes", "10 min"
  const relMinutesMatch = timeStr.match(/(?:in\s*)?(\d+)\s*(?:m|min|mins|minute|minutes)\b/i);
  if (relMinutesMatch) {
    const mins = parseInt(relMinutesMatch[1], 10);
    if (!isNaN(mins)) {
      if (mins <= 60) {
        const isCritical = mins <= 20;
        return {
          isUrgent: true,
          level: isCritical ? 'critical' : 'high',
          badgeText: isCritical ? `CRITICAL • ${mins}m LEFT` : `URGENT • ${mins}m LEFT`,
          diffMinutes: mins,
          countdownText: mins === 0 ? 'Due right now' : `Due in ${mins}m`,
          isOverdue: false,
          reason: 'relative',
        };
      }
    }
  }

  // Relative hours match: "in 1h", "1 hour"
  const relHoursMatch = timeStr.match(/(?:in\s*)?(\d+)\s*(?:h|hr|hrs|hour|hours)\b/i);
  if (relHoursMatch) {
    const hrs = parseInt(relHoursMatch[1], 10);
    if (!isNaN(hrs) && hrs <= 1) {
      const mins = hrs * 60;
      return {
        isUrgent: true,
        level: 'high',
        badgeText: `URGENT • ${mins}m LEFT`,
        diffMinutes: mins,
        countdownText: `Due in ${hrs}h`,
        isOverdue: false,
        reason: 'relative',
      };
    }
  }

  // Clock time match: "14:30", "09:15", "2:45 PM", "11:00 AM", "Today, 14:00"
  const timeMatch = timeStr.match(/(\d{1,2})[:.](\d{2})(?:\s*(am|pm))?/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const meridian = timeMatch[3];

    if (meridian) {
      if (meridian === 'pm' && hours < 12) hours += 12;
      if (meridian === 'am' && hours === 12) hours = 0;
    }

    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      const targetDate = new Date(currentTime);
      targetDate.setHours(hours, minutes, 0, 0);

      if (timeStr.includes('tomorrow')) {
        targetDate.setDate(targetDate.getDate() + 1);
      }

      const diffMs = targetDate.getTime() - currentTime.getTime();
      const diffMinutes = Math.round(diffMs / 60000);

      // Overdue within last 180 minutes (3 hours)
      if (diffMinutes < 0 && diffMinutes >= -180) {
        const absMins = Math.abs(diffMinutes);
        const badge = absMins < 60 ? `OVERDUE • ${absMins}m AGO` : `OVERDUE • ${Math.round(absMins / 60)}h AGO`;
        return {
          isUrgent: true,
          level: 'critical',
          badgeText: badge,
          diffMinutes,
          countdownText: `${absMins}m overdue`,
          isOverdue: true,
          reason: 'overdue',
        };
      }

      // Imminent within next 60 minutes
      if (diffMinutes >= 0 && diffMinutes <= 60) {
        const isCritical = diffMinutes <= 20;
        const badge =
          diffMinutes === 0
            ? 'DUE NOW'
            : isCritical
            ? `CRITICAL • ${diffMinutes}m LEFT`
            : `URGENT • ${diffMinutes}m LEFT`;

        return {
          isUrgent: true,
          level: isCritical ? 'critical' : 'high',
          badgeText: badge,
          diffMinutes,
          countdownText: diffMinutes === 0 ? 'Due right now' : `Due in ${diffMinutes}m`,
          isOverdue: false,
          reason: 'imminent',
        };
      }
    }
  }

  // Fallback for title keywords if time isn't imminent
  if (hasUrgentTitleKeyword) {
    return {
      isUrgent: true,
      level: 'high',
      badgeText: 'PRIORITY URGENT',
      diffMinutes: 999,
      countdownText: 'High Priority',
      isOverdue: false,
      reason: 'keyword',
    };
  }

  return {
    isUrgent: false,
    level: 'normal',
    badgeText: '',
    diffMinutes: null,
    countdownText: '',
    isOverdue: false,
    reason: 'none',
  };
}

/**
 * Sorts reminders bumping urgent items to the very top:
 * 1. Urgent uncompleted items (overdue first, then soonest)
 * 2. Regular uncompleted items
 * 3. Completed items
 */
export function sortRemindersByUrgency(
  reminders: Reminder[],
  currentTime: Date = new Date()
): Reminder[] {
  return [...reminders].sort((a, b) => {
    const evalA = evaluateReminderUrgency(a, currentTime);
    const evalB = evaluateReminderUrgency(b, currentTime);

    // 1. Urgent uncompleted items always on top
    if (evalA.isUrgent !== evalB.isUrgent) {
      return evalA.isUrgent ? -1 : 1;
    }

    // 2. Both are urgent: sort by priority
    if (evalA.isUrgent && evalB.isUrgent) {
      if (evalA.isOverdue && !evalB.isOverdue) return -1;
      if (!evalA.isOverdue && evalB.isOverdue) return 1;
      const diffA = evalA.diffMinutes ?? 999;
      const diffB = evalB.diffMinutes ?? 999;
      return diffA - diffB;
    }

    // 3. Uncompleted before completed
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    return 0;
  });
}

/**
 * Quick time presets for the UI
 */
export function getUrgentTimePreset(minutesFromNow: number, currentTime = new Date()): string {
  const d = new Date(currentTime.getTime() + minutesFromNow * 60000);
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${mins}`;
}
