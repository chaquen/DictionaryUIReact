/**
 * Answer grades shared by every scheduling strategy (same values as FSRS).
 */
export const Grade = Object.freeze({
  AGAIN: 1,
  HARD: 2,
  GOOD: 3,
  EASY: 4,
});

export const GRADES = Object.freeze([
  { value: Grade.AGAIN, label: 'Again', hint: 'I forgot it' },
  { value: Grade.HARD, label: 'Hard', hint: 'I remembered with effort' },
  { value: Grade.GOOD, label: 'Good', hint: 'I remembered it' },
  { value: Grade.EASY, label: 'Easy', hint: 'Too easy' },
]);

/** A review counts as correct unless the user forgot the word. */
export const isCorrect = (grade) => grade !== Grade.AGAIN;

export const isValidGrade = (grade) => Object.values(Grade).includes(grade);
