const PARIS_TIME_ZONE='Europe/Paris';

export function parisToday(now=new Date()) {
  return new Intl.DateTimeFormat('en-CA',{timeZone:PARIS_TIME_ZONE,year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
}

export function monthKey(date) {
  return String(date).slice(0,7);
}

export function moveMonth(value,offset) {
  const [year,month]=monthKey(value).split('-').map(Number);
  const next=new Date(Date.UTC(year,month-1+offset,1));
  return `${next.getUTCFullYear()}-${String(next.getUTCMonth()+1).padStart(2,'0')}`;
}

export function monthDays(value) {
  const [year,month]=monthKey(value).split('-').map(Number);
  const count=new Date(Date.UTC(year,month,0)).getUTCDate();
  const first=(new Date(Date.UTC(year,month-1,1)).getUTCDay()+6)%7;
  return {
    leading:first,
    days:Array.from({length:count},(_,index)=>`${year}-${String(month).padStart(2,'0')}-${String(index+1).padStart(2,'0')}`),
  };
}

/** @param {string} value @param {Intl.DateTimeFormatOptions} [options] */
export function formatFrenchDate(value,options={dateStyle:'full'}) {
  return new Intl.DateTimeFormat('fr-FR',{timeZone:'UTC',...options}).format(new Date(`${value}T12:00:00Z`));
}
