import React, {useState, useEffect} from 'react';
import {createEvents} from 'ics';
import {parseEvents} from '../lib/parseEvents';

export default function Parser({input, locale}) {
    const [downloadUrl, setDownloadUrl] = useState(null);
    const [message, setMessage] = useState(null);
    const [events, setEvents] = useState([]);
    const [errors, setErrors] = useState([]);
    const [title, setTitle] = useState('');
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

    // Restore saved title on load
    useEffect(() => {
        const saved = localStorage.getItem('eventTitle');
        if (saved) setTitle(saved);
    }, []);

    // Save title when it changes
    useEffect(() => {
        localStorage.setItem('eventTitle', title);
    }, [title]);

    // Live parse input
    useEffect(() => {
        const {events, errors} = parseEvents(input);
        setEvents(events);
        setErrors(errors);
    }, [input]);

    const handleGenerate = () => {
        setMessage(null);
        setDownloadUrl(null);

        if (!events.length) {
            setMessage('No events parsed.');
            return;
        }

        const total = events.length;

        createEvents(
            events.map((ev, i) => {
                const numberedTitle = `HOLD: ${title ? `${title} ` : ''}[${i + 1}/${total}]`;
                return {
                    start: [
                        ev.start.getFullYear(),
                        ev.start.getMonth() + 1,
                        ev.start.getDate(),
                        ev.start.getHours(),
                        ev.start.getMinutes(),
                    ],
                    end: [
                        ev.end.getFullYear(),
                        ev.end.getMonth() + 1,
                        ev.end.getDate(),
                        ev.end.getHours(),
                        ev.end.getMinutes(),
                    ],
                    title: numberedTitle,
                    description: `${numberedTitle}\n${ev.description}`,
                };
            }),
            (err, val) => {
                if (err) {
                    console.error(err);
                    setMessage('ICS generation failed.');
                    return;
                }
                const blob = new Blob([val], {type: 'text/calendar;charset=utf-8'});
                setDownloadUrl(URL.createObjectURL(blob));
                setMessage(`Generated ${total} event(s).`);
            }
        );
    };


    // Formatting helper
    const fmt = (d, opts = {}) =>
        d.toLocaleString(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            ...opts,
        });

    const fmtTime = d =>
        d.toLocaleString(locale, {hour: '2-digit', minute: '2-digit'});

    return (
        <div>
            {/* Parsed event preview */}
            {input.trim().length > 0 && (
                <div
                    className={`mt-4 text-sm transition-all duration-300 ${
                        events.length ? 'opacity-100 max-h-screen' : 'opacity-0 max-h-0 overflow-hidden'
                    }`}
                >
                    {events.length > 0 ? (
                        <>
                            <div className="font-medium mb-1 text-emerald-700">Parsed Events:</div>
                            <ul className="list-disc pl-5 space-y-1 text-gray-800">
                                {events.map((ev, i) => {
                                    const sameDay = ev.start.toDateString() === ev.end.toDateString();
                                    const prefix = sameDay
                                        ? `${fmt(ev.start)} → ${fmtTime(ev.end)}`
                                        : `${fmt(ev.start)} → ${fmt(ev.end)}`;
                                    return (
                                        <li key={i}>
                                            {prefix}{' '}
                                            <span className="text-gray-500">
                  ({`HOLD: ${title ? `${title} ` : ''}[${i + 1}/${events.length}]`})
                </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </>
                    ) : (
                        <div className="italic text-gray-400">Enter text above to see parsed events</div>
                    )}
                </div>
            )}


            {/* Errors */}
            {errors.length > 0 && (
                <div className="mt-4 text-sm text-red-600">
                    <div className="font-medium mb-1">Issues found:</div>
                    <ul className="list-disc pl-5 space-y-1">
                        {errors.map((err, i) => (
                            <li key={i}>{err}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Custom title input */}
            <div className="mt-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event title (optional)
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. External Visit"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-5">
                <button
                    onClick={handleGenerate}
                    className="px-4 py-2 rounded-md shadow-sm"
                    style={{background: '#16a39a', color: 'white'}}
                >
                    Generate ICS
                </button>
                {downloadUrl && (
                    <a
                        className="px-4 py-2 rounded-md border"
                        href={downloadUrl}
                        download="events.ics"
                    >
                        Download .ics
                    </a>
                )}
            </div>

            {/* Footer */}
            {message && <div className="mt-3 text-sm text-gray-700">{message}</div>}
            <div className="mt-4 text-xs text-gray-500">
                Timezone used: <strong>{timezone}</strong>
            </div>
        </div>
    );
}
