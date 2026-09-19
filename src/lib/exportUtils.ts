import { Reminder, StarkNote } from '../types';

/**
 * Cleanly format and trigger browser download of a JSON file
 */
export function downloadJSON(data: any, filename: string) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.json') ? filename : `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Cleanly format and trigger browser download of a CSV file
 */
export function downloadCSV(
  rows: Record<string, any>[],
  columns: { key: string; label: string }[],
  filename: string
) {
  if (!rows || rows.length === 0) {
    const emptyHeader = columns.map((c) => `"${c.label.replace(/"/g, '""')}"`).join(',');
    const blob = new Blob([emptyHeader + '\n'], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }

  const headerLine = columns.map((c) => `"${c.label.replace(/"/g, '""')}"`).join(',');
  const lines = rows.map((row) => {
    return columns
      .map((col) => {
        let val = row[col.key];
        if (val === undefined || val === null) val = '';
        if (typeof val === 'boolean') val = val ? 'YES' : 'NO';
        val = String(val).replace(/"/g, '""');
        return `"${val}"`;
      })
      .join(',');
  });

  const csvContent = [headerLine, ...lines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export Reminders as JSON
 */
export function exportRemindersToJSON(reminders: Reminder[]) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const payload = {
    exportType: 'DEVIL_STARK_REMINDERS_BACKUP',
    version: '2.5',
    exportedAt: new Date().toISOString(),
    totalCount: reminders.length,
    activeCount: reminders.filter((r) => !r.completed).length,
    completedCount: reminders.filter((r) => r.completed).length,
    reminders: reminders.map((r) => ({
      id: r.id,
      title: r.title,
      time: r.time,
      completed: !!r.completed,
      isPinned: !!r.isPinned,
    })),
  };
  downloadJSON(payload, `devil-reminders-backup-${timestamp}.json`);
}

/**
 * Export Reminders as CSV
 */
export function exportRemindersToCSV(reminders: Reminder[]) {
  const timestamp = new Date().toISOString().slice(0, 10);
  const columns = [
    { key: 'id', label: 'Reminder ID' },
    { key: 'title', label: 'Title / Task' },
    { key: 'time', label: 'Scheduled Time' },
    { key: 'completed', label: 'Completed' },
    { key: 'isPinned', label: 'Pinned to HUD' },
  ];
  downloadCSV(reminders, columns, `devil-reminders-backup-${timestamp}.csv`);
}

/**
 * Export Stark Notes as JSON
 */
export function exportNotesToJSON(notes: StarkNote[]) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const payload = {
    exportType: 'DEVIL_STARK_NOTES_BACKUP',
    version: '2.5',
    exportedAt: new Date().toISOString(),
    totalCount: notes.length,
    notes: notes.map((n) => ({
      id: n.id,
      title: n.title,
      content: n.content,
      category: n.category,
      createdAt: n.createdAt,
      isPinned: !!n.isPinned,
    })),
  };
  downloadJSON(payload, `devil-notes-backup-${timestamp}.json`);
}

/**
 * Export Stark Notes as CSV
 */
export function exportNotesToCSV(notes: StarkNote[]) {
  const timestamp = new Date().toISOString().slice(0, 10);
  const columns = [
    { key: 'id', label: 'Note ID' },
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category' },
    { key: 'content', label: 'Content / Intel' },
    { key: 'createdAt', label: 'Created At' },
    { key: 'isPinned', label: 'Pinned to HUD' },
  ];
  downloadCSV(notes, columns, `devil-notes-backup-${timestamp}.csv`);
}

/**
 * Export unified full system vault backup (Reminders + Notes) as JSON
 */
export function exportUnifiedVaultBackup(reminders: Reminder[], notes: StarkNote[]) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const payload = {
    exportType: 'DEVIL_STARK_FULL_VAULT_BACKUP',
    version: '2.5',
    system: 'DEVIL J.A.R.V.I.S. AI OS',
    exportedAt: new Date().toISOString(),
    meta: {
      totalReminders: reminders.length,
      totalNotes: notes.length,
      device: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown Device',
    },
    reminders,
    notes,
  };
  downloadJSON(payload, `devil-full-vault-backup-${timestamp}.json`);
}
