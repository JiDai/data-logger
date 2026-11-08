<script lang="ts">
	type Props = {
		label: string;
		/** Called with the pointer's clientX while dragging. */
		onDrag: (clientX: number) => void;
		/** Called with -1 / +1 when using arrow keys (shift for a larger step). */
		onStep: (direction: -1 | 1, large: boolean) => void;
		/** Called on double-click or Enter to restore the default size. */
		onReset: () => void;
		/** Called once a drag or keyboard change ends, to persist the size. */
		onCommit: () => void;
		value?: number;
	};
	let { label, onDrag, onStep, onReset, onCommit, value }: Props = $props();

	let dragging = $state(false);

	// Avoid selecting text and keep the resize cursor while dragging across panels.
	$effect(() => {
		if (!dragging) return;
		document.body.classList.add('select-none', 'cursor-col-resize');
		return () => document.body.classList.remove('select-none', 'cursor-col-resize');
	});

	function handlePointerDown(event: PointerEvent) {
		if (event.button !== 0) return;
		event.preventDefault();
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		dragging = true;
	}

	function handlePointerMove(event: PointerEvent) {
		if (!dragging) return;
		onDrag(event.clientX);
	}

	function handlePointerUp(event: PointerEvent) {
		if (!dragging) return;
		dragging = false;
		(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
		onCommit();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
			event.preventDefault();
			onStep(event.key === 'ArrowLeft' ? -1 : 1, event.shiftKey);
			onCommit();
		} else if (event.key === 'Enter') {
			event.preventDefault();
			onReset();
			onCommit();
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex a11y_no_noninteractive_element_interactions -->
<div
	role="separator"
	aria-orientation="vertical"
	aria-label={label}
	aria-valuenow={value}
	tabindex="0"
	title={`${label} — drag to resize, double-click to reset`}
	class="group relative z-20 w-1 shrink-0 cursor-col-resize touch-none outline-none"
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	onpointercancel={handlePointerUp}
	ondblclick={() => {
		onReset();
		onCommit();
	}}
	onkeydown={handleKeydown}
>
	<div
		class="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-neutral transition-colors group-hover:w-0.5 group-hover:bg-primary group-focus-visible:w-0.5 group-focus-visible:bg-primary"
		class:!w-0.5={dragging}
		class:!bg-primary={dragging}
	></div>
</div>
