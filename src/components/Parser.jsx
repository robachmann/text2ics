import React, { useState } from 'react'
import { createEvents } from 'ics'

const MONTHS_DE = { januar:1,februar:2,märz:3,maerz:3,april:4,mai:5,juni:6,juli:7,august:8,september:9,oktober:10,november:11,dezember:12 }
const normalizeMonth = s => s?.toLowerCase().replace(/\./g,'').trim()

const parseTimeRanges = str => {
  const parts = str.split(/\s+und\s+|,\s*/i).map(p=>p.trim()).filter(Boolean)
  return parts.map(p=>{const m=p.match(/(\d{1,2})([:\.]?(\d{2}))?\s*-\s*(\d{1,2})([:\.]?(\d{2}))?/)
    if(!m)return null;return{sh:+m[1],sm:m[3]?+m[3]:0,eh:+m[4],em:m[6]?+m[6]:0}}).filter(Boolean)
}

export default function Parser({ input, locale }) {
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [message, setMessage] = useState(null)
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC'

  const handleGenerate=()=>{
    setMessage(null);setDownloadUrl(null)
    const lines=input.split(/\r?\n/).map(l=>l.trim()).filter(Boolean)
    const now=new Date();const year=now.getFullYear();const events=[]

    for(const raw of lines){
      const parts=raw.split(',').map(p=>p.trim()).filter(Boolean)
      const datePart=parts.find(p=>/\d/.test(p)&&/[A-Za-zÄÖÜäöü]/.test(p))||parts[0]
      const dayMatch=datePart.match(/(\d{1,2})/)
      const monthMatch=datePart.match(/([A-Za-zÄÖÜäöüß\.]+)/g)
      let day=dayMatch?+dayMatch[1]:null
      let month=null
      if(monthMatch){const token=monthMatch.slice(-1)[0];month=MONTHS_DE[normalizeMonth(token)]}
      if(!month){const en=['january','february','march','april','may','june','july','august','september','october','november','december'];for(const t of datePart.toLowerCase().split(/\s+/)){const ti=t.replace(/\.|,/g,'');const idx=en.indexOf(ti);if(idx>=0)month=idx+1}}
      if(!day||!month){setMessage(`Could not parse date: ${raw}`);continue}
      const afterDate=raw.slice(raw.indexOf(datePart)+datePart.length).replace(/^[,\s-–—]+/,'')
      const timeRanges=parseTimeRanges(afterDate)
      if(!timeRanges.length){setMessage(`No time range found: ${raw}`);continue}
      for(const r of timeRanges){const s=new Date(year,month-1,day,r.sh,r.sm,0);const e=new Date(year,month-1,day,r.eh,r.em,0);if(e<=s)e.setDate(e.getDate()+1);events.push({start:[s.getFullYear(),s.getMonth()+1,s.getDate(),s.getHours(),s.getMinutes()],end:[e.getFullYear(),e.getMonth()+1,e.getDate(),e.getHours(),e.getMinutes()],title:raw,description:raw})}
    }
    if(!events.length){setMessage('No events parsed.');return}
    createEvents(events,(err,val)=>{if(err){console.error(err);setMessage('ICS generation failed.');return;}
      const blob=new Blob([val],{type:'text/calendar;charset=utf-8'});setDownloadUrl(URL.createObjectURL(blob));setMessage(`Generated ${events.length} event(s).`)})
  }

  return(<div><div className="flex gap-3">
    <button onClick={handleGenerate} className="px-4 py-2 rounded-md shadow-sm" style={{background:'#16a39a',color:'white'}}>Generate ICS</button>
    {downloadUrl&&<a className="px-4 py-2 rounded-md border" href={downloadUrl} download="events.ics">Download .ics</a>}
  </div>
  {message&&<div className="mt-3 text-sm text-gray-700">{message}</div>}
  <div className="mt-4 text-xs text-gray-500">Timezone used: <strong>{timezone}</strong></div></div>)
}
