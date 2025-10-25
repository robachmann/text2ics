import React, { useState } from 'react'
import Parser from './components/Parser'

export default function App() {
  const [input, setInput] = useState(`Freitag, 7. November, 10-16 Uhr
Mittwoch, 5. November, 10-12 Uhr und 14-18 Uhr`)
  const [locale, setLocale] = useState(navigator.language || 'de')

  return (
    <div className="min-h-screen flex items-center p-6">
      <div className="card w-full">
        <h1 className="text-2xl font-semibold mb-1" style={{color: '#0f665f'}}>ICS Event Generator</h1>
        <p className="text-sm text-gray-600 mb-4">Paste free-form event lines (one day per line). Uses your locale and timezone by default.</p>
        <div className="flex gap-3 mb-4 items-center">
          <label className="text-sm">Locale:</label>
          <select className="border rounded px-2 py-1" value={locale} onChange={(e) => setLocale(e.target.value)}>
            <option value={navigator.language || 'de'}>{navigator.language || 'de'} (browser)</option>
            <option value="de">de</option>
            <option value="en">en</option>
            <option value="fr">fr</option>
            <option value="it">it</option>
          </select>
        </div>
        <textarea rows={8} className="w-full rounded-md p-3 border mb-4"
          value={input} onChange={(e) => setInput(e.target.value)} />
        <Parser input={input} locale={locale} />

      </div>
    </div>
  )
}
