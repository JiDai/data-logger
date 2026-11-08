const PREFIX = 'data-logger:';

export function readNumber(key: string, fallback: number): number {
	try {
		const raw = localStorage.getItem(PREFIX + key);
		if (raw === null) return fallback;
		const value = Number(raw);
		return Number.isFinite(value) ? value : fallback;
	} catch {
		return fallback;
	}
}

export function writeNumber(key: string, value: number): void {
	try {
		localStorage.setItem(PREFIX + key, String(value));
	} catch {
		// Storage unavailable: size simply won't persist.
	}
}

export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), Math.max(min, max));
}
