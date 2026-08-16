"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

export type PredictionItem = {
  value: string;
  label: string;
  hint?: string;
};

type PredictiveTextFieldProps = {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  className?: string;
  labelClassName?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  onSelectPrediction?: (item: PredictionItem) => void;
  predictions: PredictionItem[];
  emptyHint?: string;
};

export function PredictiveTextField({
  id,
  name,
  label,
  required,
  autoComplete = "off",
  placeholder,
  className,
  labelClassName,
  value: controlledValue,
  onValueChange,
  onSelectPrediction,
  predictions,
  emptyHint = "Keep typing your own value if it is not listed.",
}: PredictiveTextFieldProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [internalValue, setInternalValue] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const value = controlledValue ?? internalValue;

  const options = useMemo(() => predictions.slice(0, 8), [predictions]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function setValue(next: string) {
    if (controlledValue === undefined) setInternalValue(next);
    onValueChange?.(next);
  }

  function choose(item: PredictionItem) {
    setValue(item.value);
    onSelectPrediction?.(item);
    setOpen(false);
    setActiveIndex(-1);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setOpen(true);
      setActiveIndex(0);
      event.preventDefault();
      return;
    }
    if (!open) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % Math.max(options.length, 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) =>
        i <= 0 ? Math.max(options.length - 1, 0) : i - 1,
      );
    } else if (event.key === "Enter" && activeIndex >= 0 && options[activeIndex]) {
      event.preventDefault();
      choose(options[activeIndex]);
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={className}
        value={value}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
        }
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-56 w-full overflow-auto border border-line bg-paper-deep shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
        >
          {options.length ? (
            options.map((item, index) => {
              const active = index === activeIndex;
              return (
                <li key={`${item.value}-${item.hint || ""}`} role="presentation">
                  <button
                    id={`${listId}-option-${index}`}
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={`flex w-full items-baseline justify-between gap-3 px-3.5 py-2.5 text-left text-sm transition ${
                      active
                        ? "bg-teal-muted text-ink"
                        : "text-ink hover:bg-teal-muted/60"
                    }`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(item)}
                  >
                    <span className="font-semibold">{item.label}</span>
                    {item.hint ? (
                      <span className="shrink-0 text-xs text-muted">
                        {item.hint}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })
          ) : (
            <li className="px-3.5 py-2.5 text-xs text-muted">{emptyHint}</li>
          )}
        </ul>
      ) : null}
    </div>
  );
}
