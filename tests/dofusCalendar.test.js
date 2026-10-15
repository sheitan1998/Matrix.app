import test from 'node:test';
import assert from 'node:assert/strict';
import {monthDays,moveMonth,parisToday} from '../src/components/tuto-gaming/dofusCalendar.js';

test('builds leap months and moves across year boundaries',()=>{
  assert.equal(monthDays('2028-02').days.length,29);
  assert.equal(moveMonth('2026-12',1),'2027-01');
  assert.equal(moveMonth('2026-01',-1),'2025-12');
});

test('uses the Europe/Paris calendar day',()=>{
  assert.equal(parisToday(new Date('2026-10-15T22:30:00Z')),'2026-10-16');
});
