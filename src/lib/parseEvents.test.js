import {parseEvents} from './parseEvents.js';

describe('parseEvents', () => {
    it('parses single time range', () => {
        const res = parseEvents('Freitag, 7. November, 10-16 Uhr', 2025);
        expect(res.errors).toHaveLength(0);
        expect(res.events).toHaveLength(1);

        const e = res.events[0];
        expect(e.start.getDate()).toBe(7);
        expect(e.start.getHours()).toBe(10);
        expect(e.end.getHours()).toBe(16);
        expect(e.start.getMonth()).toBe(10); // November (0-based)
    });

    it('parses single time range, no comma between month and hours', () => {
        const res = parseEvents('Montag, 10. November 10-15 Uhr', 2025);
        expect(res.errors).toHaveLength(0);
        expect(res.events).toHaveLength(1);

        const e = res.events[0];
        expect(e.start.getDate()).toBe(10);
        expect(e.start.getHours()).toBe(10);
        expect(e.end.getHours()).toBe(15);
        expect(e.start.getMonth()).toBe(10); // November
    });

    it('parses multiple time ranges on one line', () => {
        const res = parseEvents('Dienstag, 12. Mai, 8-10 und 14-16 Uhr', 2025);
        expect(res.errors).toHaveLength(0);
        expect(res.events).toHaveLength(2);

        const [a, b] = res.events;
        expect(a.start.getDate()).toBe(12);
        expect(a.start.getHours()).toBe(8);
        expect(b.start.getHours()).toBe(14);
    });

    it('handles malformed input gracefully', () => {
        const res = parseEvents('Unparseable nonsense');
        expect(res.events).toHaveLength(0);
        expect(res.errors.length).toBeGreaterThan(0);
    });
});
