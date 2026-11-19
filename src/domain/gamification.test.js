import { describe, expect, it } from 'vitest';
import { computeProgress, levelFor, xpForLevel } from './gamification';
import { EventType, Idea, createEvent } from './learningEvent';

const at = (iso) => new Date(iso);
const saved = (iso, term = 'word') =>
  createEvent({ idea: Idea.COLLECTION, type: EventType.WORD_SAVED, term }, at(iso));
const reviewed = (iso, correct = true) =>
  createEvent({ idea: Idea.REVIEW, type: EventType.WORD_REVIEWED, term: 'word', correct }, at(iso));

describe('levels', () => {
  it('needs growing XP for each level', () => {
    expect([1, 2, 3, 4].map(xpForLevel)).toEqual([0, 50, 150, 300]);
    expect(levelFor(0)).toEqual({ level: 1, xpIntoLevel: 0, xpForNextLevel: 50 });
    expect(levelFor(49).level).toBe(1);
    expect(levelFor(50)).toEqual({ level: 2, xpIntoLevel: 0, xpForNextLevel: 100 });
    expect(levelFor(160)).toEqual({ level: 3, xpIntoLevel: 10, xpForNextLevel: 150 });
  });
});

describe('computeProgress', () => {
  it('starts empty', () => {
    const p = computeProgress([], at('2026-11-19T10:00:00'));
    expect(p).toMatchObject({ xp: 0, level: 1, streak: 0, streakLost: false, activeToday: false });
    expect(p.achievements.every((a) => a.unlockedAt === null)).toBe(true);
  });

  it('gives XP for saving and reviewing, with a bonus for correct answers', () => {
    const p = computeProgress(
      [saved('2026-11-19T09:00:00'), reviewed('2026-11-19T09:05:00', true), reviewed('2026-11-19T09:06:00', false)],
      at('2026-11-19T10:00:00'),
    );
    expect(p.xp).toBe(5 + 15 + 10);
  });

  it('counts consecutive active days and keeps the streak alive until the end of the next day', () => {
    const events = [saved('2026-11-16T20:00:00'), reviewed('2026-11-17T08:00:00'), reviewed('2026-11-18T21:00:00')];

    expect(computeProgress(events, at('2026-11-18T22:00:00'))).toMatchObject({ streak: 3, activeToday: true });
    expect(computeProgress(events, at('2026-11-19T10:00:00'))).toMatchObject({ streak: 3, activeToday: false });
  });

  it('resets the streak after a day without activity and says so', () => {
    const events = [saved('2026-11-16T20:00:00'), reviewed('2026-11-17T08:00:00')];
    const p = computeProgress(events, at('2026-11-19T10:00:00'));
    expect(p).toMatchObject({ streak: 0, bestStreak: 2, streakLost: true });
  });

  it('unlocks achievements when their condition is first met', () => {
    const events = [saved('2026-11-17T08:00:00')];
    for (let i = 0; i < 10; i += 1) events.push(reviewed(`2026-11-18T08:${String(i).padStart(2, '0')}:00`));
    for (let d = 19; d <= 21; d += 1) events.push(reviewed(`2026-11-${d}T08:00:00`));

    const p = computeProgress(events, at('2026-11-21T12:00:00'));
    const unlocked = Object.fromEntries(p.achievements.map((a) => [a.id, a.unlockedAt]));

    expect(unlocked['first-word']).toBe(at('2026-11-17T08:00:00').toISOString());
    expect(unlocked['first-review']).toBe(at('2026-11-18T08:00:00').toISOString());
    expect(unlocked['perfect-ten']).toBe(at('2026-11-18T08:09:00').toISOString());
    expect(unlocked['streak-3']).toBe(at('2026-11-19T08:00:00').toISOString());
    expect(unlocked['ten-words']).toBeNull();
    expect(p.streak).toBe(5);
  });

  it('a wrong answer breaks the run of correct answers', () => {
    const events = [];
    for (let i = 0; i < 9; i += 1) events.push(reviewed(`2026-11-18T08:0${i}:00`));
    events.push(reviewed('2026-11-18T08:10:00', false), reviewed('2026-11-18T08:11:00'));
    const p = computeProgress(events, at('2026-11-18T12:00:00'));
    expect(p.achievements.find((a) => a.id === 'perfect-ten').unlockedAt).toBeNull();
  });
});
