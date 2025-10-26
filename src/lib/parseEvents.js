// src/lib/parseEvents.js
import {MONTHS_DE} from './months.js';

const normalizeMonth = (s) => s?.toLowerCase().replace(/\./g, '').trim();
const TIME_RANGE_RE = /(\d{1,2}(?:[:\.]\d{2})?)\s*-\s*(\d{1,2}(?:[:\.]\d{2})?)/;

const parseTimeRanges = (str) => {
    if (!str) return [];
    const parts = str.split(/\s+und\s+|,\s*/i).map((p) => p.trim()).filter(Boolean);
    return parts
        .map((p) => {
            const m = p.match(/(\d{1,2})([:\.]?(\d{2}))?\s*-\s*(\d{1,2})([:\.]?(\d{2}))?/);
            if (!m) return null;
            return {sh: +m[1], sm: m[3] ? +m[3] : 0, eh: +m[4], em: m[6] ? +m[6] : 0};
        })
        .filter(Boolean);
};

export function parseEvents(input, yearOverride) {
    const lines = (input || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const now = new Date();
    const year = yearOverride ?? now.getFullYear();
    const events = [];
    const errors = [];

    for (const raw of lines) {
        const parts = raw.split(',').map((p) => p.trim()).filter(Boolean);
        let dateToken = parts.find((p) => /\d/.test(p) && /[A-Za-zÄÖÜäöü]/.test(p)) || parts[0] || raw;

        let afterDate = '';
        const dateTokenTimeMatch = dateToken.match(TIME_RANGE_RE);
        if (dateTokenTimeMatch) {
            const idx = dateToken.indexOf(dateTokenTimeMatch[0]);
            afterDate = dateToken.slice(idx);
            dateToken = dateToken.slice(0, idx).trim();
        } else {
            const idxOfDateTokenInRaw = raw.indexOf(dateToken);
            afterDate = idxOfDateTokenInRaw >= 0
                ? raw.slice(idxOfDateTokenInRaw + dateToken.length)
                : raw.replace(dateToken, '');
        }

        if (!TIME_RANGE_RE.test(afterDate)) {
            const fallbackTimeMatch = raw.match(TIME_RANGE_RE);
            if (fallbackTimeMatch) {
                const idx = raw.indexOf(fallbackTimeMatch[0]);
                afterDate = raw.slice(idx);
            }
        }
        afterDate = afterDate.replace(/^[,\s-–—]+/, '');

        const dayMatch = dateToken.match(/(\d{1,2})/);
        const monthMatch = dateToken.match(/([A-Za-zÄÖÜäöüß\.]+)/g);
        const day = dayMatch ? +dayMatch[1] : null;
        let month = null;

        if (monthMatch) {
            const token = monthMatch.slice(-1)[0];
            month = MONTHS_DE[normalizeMonth(token)];
        }

        if (!month) {
            const en = [
                'january', 'february', 'march', 'april', 'may', 'june',
                'july', 'august', 'september', 'october', 'november', 'december',
            ];
            for (const t of dateToken.toLowerCase().split(/\s+/)) {
                const ti = t.replace(/\.|,/g, '');
                const idx = en.indexOf(ti);
                if (idx >= 0) month = idx + 1;
            }
        }

        if (!day || !month) {
            errors.push(`Could not parse date in: "${raw}"`);
            continue;
        }

        const timeRanges = parseTimeRanges(afterDate);
        if (!timeRanges.length) {
            errors.push(`No time range found in: "${raw}"`);
            continue;
        }

        for (const r of timeRanges) {
            const s = new Date(year, month - 1, day, r.sh, r.sm, 0);
            const e = new Date(year, month - 1, day, r.eh, r.em, 0);
            if (e <= s) e.setDate(e.getDate() + 1);
            events.push({start: s, end: e, title: raw, description: raw});
        }
    }

    return {events, errors};
}
