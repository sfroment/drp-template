import { ExampleDRPObject } from "./object/object";

export const drpState = {
	drpID: "",
	drp: null as ExampleDRPObject | null,
	isRendering: false,
	startCaretPosition: 0,
	endCaretPosition: 0,
};

const prevStart: number = 0;
const prevEnd: number = 0;
let prevRange: Range | null = null;

export function getCaretPosition(element: HTMLDivElement) {
	const selection = window.getSelection();
	if (!selection || !selection.rangeCount)
		return { start: 0, end: 0, prevRange };

	const range = selection.getRangeAt(0);
	const preRange = range.cloneRange();
	preRange.selectNodeContents(element);
	preRange.setEnd(range.startContainer, range.startOffset);

	const start = preRange.toString().length;
	const end = start + range.toString().length;

	//drpState.startCaretPosition = start;
	//drpState.endCaretPosition = end;
	prevRange = range;

	return {
		range,
		start,
		end,
	};
}

export interface SavedSelection {
	start: number;
	end: number;
}

export let savedSelection: SavedSelection | null = null;

// Utility to save the cursor/selection
export function saveSelection(containerEl: HTMLElement) {
	const selection = window.getSelection();
	if (!selection || selection.rangeCount === 0) return null;

	const range = selection.getRangeAt(0);
	const preSelectionRange = range.cloneRange();
	preSelectionRange.selectNodeContents(containerEl);
	preSelectionRange.setEnd(range.startContainer, range.startOffset);

	const start = preSelectionRange.toString().length;
	const end = start + range.toString().length;
	savedSelection = { start, end };
	return { start, end };
}

// Utility to restore the cursor/selection
export function restoreSelection(
	containerEl: HTMLElement,
	savedSel: SavedSelection | null,
) {
	if (!savedSel) return;

	const range = document.createRange();
	const selection = window.getSelection();
	if (!selection) return;

	let charIndex = 0;
	const nodeStack = Array.from(containerEl.childNodes);
	let node,
		foundStart = false,
		stop = false;

	while (!stop && (node = nodeStack.shift())) {
		if (
			node.nodeType === Node.TEXT_NODE ||
			node.nodeType === Node.ELEMENT_NODE
		) {
			const textNode = node.textContent || "";
			const nextCharIndex = charIndex + textNode.length;

			if (
				!foundStart &&
				savedSel.start >= charIndex &&
				savedSel.start <= nextCharIndex
			) {
				const start = savedSel.start - charIndex;
				range.setStart(node, start > 0 ? start : 0);
				foundStart = true;
			}

			if (
				foundStart &&
				savedSel.end >= charIndex &&
				savedSel.end <= nextCharIndex
			) {
				const end = savedSel.end - charIndex;
				range.setEnd(node, end > 0 ? end : 0);
				stop = true;
			}

			charIndex = nextCharIndex;
		} else {
			nodeStack.push(...node.childNodes);
		}
	}

	// reset to the start of containerEl
	if (!foundStart && !stop) {
		range.setStart(containerEl, 0);
		range.setEnd(containerEl, 0);
		selection.removeAllRanges();
		selection.addRange(range);
		return;
	}
	selection.removeAllRanges();
	selection.addRange(range);
}
