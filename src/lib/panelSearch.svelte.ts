const MATCH_CLASS = 'search-match';
const ACTIVE_CLASS = 'search-match-active';

function escapeRegExp(value: string) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildMatcher(query: string, caseSensitive: boolean, useRegex: boolean): RegExp | null {
	if (!query) return null;
	const flags = caseSensitive ? 'g' : 'gi';
	const source = useRegex ? query : escapeRegExp(query);
	try {
		return new RegExp(source, flags);
	} catch {
		return null;
	}
}

function clearMatches(root: HTMLElement) {
	const marks = root.querySelectorAll(`mark.${MATCH_CLASS}`);
	marks.forEach((mark) => {
		const parent = mark.parentNode;
		if (!parent) return;
		while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
		parent.removeChild(mark);
		parent.normalize();
	});
}

function highlightMatches(root: HTMLElement, matcher: RegExp): HTMLElement[] {
	const marks: HTMLElement[] = [];
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
		acceptNode(node) {
			return node.nodeValue ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
		},
	});

	const textNodes: Text[] = [];
	let node: Node | null;
	while ((node = walker.nextNode())) {
		textNodes.push(node as Text);
	}

	for (const textNode of textNodes) {
		const text = textNode.nodeValue ?? '';
		matcher.lastIndex = 0;
		let match: RegExpExecArray | null;
		let lastIndex = 0;
		let found = false;
		const fragments: Node[] = [];

		while ((match = matcher.exec(text))) {
			const [matchText] = match;
			if (matchText.length === 0) {
				matcher.lastIndex++;
				continue;
			}
			found = true;
			if (match.index > lastIndex) {
				fragments.push(document.createTextNode(text.slice(lastIndex, match.index)));
			}
			const mark = document.createElement('mark');
			mark.className = MATCH_CLASS;
			mark.textContent = matchText;
			fragments.push(mark);
			marks.push(mark);
			lastIndex = match.index + matchText.length;
		}

		if (!found) continue;

		if (lastIndex < text.length) {
			fragments.push(document.createTextNode(text.slice(lastIndex)));
		}

		const parent = textNode.parentNode;
		if (!parent) continue;
		for (const fragment of fragments) {
			parent.insertBefore(fragment, textNode);
		}
		parent.removeChild(textNode);
	}

	return marks;
}

export class PanelSearch {
	open = $state(false);
	query = $state('');
	caseSensitive = $state(false);
	useRegex = $state(false);
	matchCount = $state(0);
	currentIndex = $state(-1);
	invalidRegex = $state(false);

	#container: HTMLElement | null = null;
	#observer: MutationObserver | null = null;
	#marks: HTMLElement[] = [];
	#rescanScheduled = false;

	action = (node: HTMLElement) => {
		this.#container = node;
		this.#observer = new MutationObserver(() => this.#scheduleRescan());
		this.#observer.observe(node, { childList: true, subtree: true, characterData: true });
		return {
			destroy: () => {
				this.#observer?.disconnect();
				this.#observer = null;
				this.#container = null;
			},
		};
	};

	toggleOpen() {
		this.open = !this.open;
		if (this.open) {
			this.#scheduleRescan();
		} else {
			this.#clear();
		}
	}

	close() {
		this.open = false;
		this.#clear();
	}

	setQuery(value: string) {
		this.query = value;
		this.#scheduleRescan();
	}

	toggleCaseSensitive() {
		this.caseSensitive = !this.caseSensitive;
		this.#scheduleRescan();
	}

	toggleRegex() {
		this.useRegex = !this.useRegex;
		this.#scheduleRescan();
	}

	next() {
		if (this.matchCount === 0) return;
		this.currentIndex = (this.currentIndex + 1) % this.matchCount;
		this.#applyActive();
	}

	previous() {
		if (this.matchCount === 0) return;
		this.currentIndex = (this.currentIndex - 1 + this.matchCount) % this.matchCount;
		this.#applyActive();
	}

	#clear() {
		this.query = '';
		this.matchCount = 0;
		this.currentIndex = -1;
		this.invalidRegex = false;
		this.#withObserverPaused(() => {
			if (this.#container) clearMatches(this.#container);
		});
		this.#marks = [];
	}

	#scheduleRescan() {
		if (this.#rescanScheduled) return;
		this.#rescanScheduled = true;
		queueMicrotask(() => {
			this.#rescanScheduled = false;
			this.#rescan();
		});
	}

	#withObserverPaused(fn: () => void) {
		this.#observer?.disconnect();
		fn();
		if (this.#container) {
			this.#observer?.observe(this.#container, { childList: true, subtree: true, characterData: true });
		}
	}

	#rescan() {
		if (!this.#container || !this.open) return;

		this.#withObserverPaused(() => {
			clearMatches(this.#container!);
			this.#marks = [];

			if (!this.query) {
				this.invalidRegex = false;
				this.matchCount = 0;
				this.currentIndex = -1;
				return;
			}

			const matcher = buildMatcher(this.query, this.caseSensitive, this.useRegex);
			if (!matcher) {
				this.invalidRegex = true;
				this.matchCount = 0;
				this.currentIndex = -1;
				return;
			}

			this.invalidRegex = false;
			this.#marks = highlightMatches(this.#container!, matcher);
			this.matchCount = this.#marks.length;
			this.currentIndex = this.matchCount > 0 ? 0 : -1;
		});

		this.#applyActive();
	}

	#applyActive() {
		this.#marks.forEach((mark, index) => {
			mark.classList.toggle(ACTIVE_CLASS, index === this.currentIndex);
		});
		const active = this.currentIndex >= 0 ? this.#marks[this.currentIndex] : null;
		active?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
	}
}
