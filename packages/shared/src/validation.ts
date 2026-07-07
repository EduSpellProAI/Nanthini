export function isValidDifficulty(value: string): boolean {
  return ['beginner', 'intermediate', 'advanced'].includes(value);
}

export function isValidScore(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 100;
}

export function validateStudentName(name: string): string {
  return name.trim().length >= 2 ? name.trim() : 'Student';
}
