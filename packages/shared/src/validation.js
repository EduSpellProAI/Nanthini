export function isValidDifficulty(value) {
    return ['beginner', 'intermediate', 'advanced'].includes(value);
}
export function isValidScore(value) {
    return Number.isFinite(value) && value >= 0 && value <= 100;
}
export function validateStudentName(name) {
    return name.trim().length >= 2 ? name.trim() : 'Student';
}
