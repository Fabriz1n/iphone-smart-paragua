import { useEffect, useRef } from "react";

const MIN_TAG_LENGTH = 4;
const MAX_TAG_LENGTH = 128;
const MAX_KEY_GAP_MS = 100;

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

export function useRfidScanner(onScan: (tagCode: string) => void): void {
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    let buffer = "";
    let lastKeyAt = 0;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.isComposing || event.ctrlKey || event.altKey || event.metaKey || isEditableTarget(event.target)) {
        buffer = "";
        return;
      }

      const now = Date.now();
      if (now - lastKeyAt > MAX_KEY_GAP_MS) buffer = "";
      lastKeyAt = now;

      if (event.key === "Enter") {
        const tagCode = buffer.trim();
        buffer = "";
        if (tagCode.length >= MIN_TAG_LENGTH && tagCode.length <= MAX_TAG_LENGTH) {
          event.preventDefault();
          onScanRef.current(tagCode);
        }
        return;
      }

      if (event.key.length === 1 && buffer.length < MAX_TAG_LENGTH) {
        buffer += event.key;
      } else if (event.key.length !== 1) {
        buffer = "";
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, []);
}
