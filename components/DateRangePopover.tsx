"use client";

import { useState, useRef, useEffect } from "react";
import DateRangeFilter from "./DateRangeFilter";
import { addDays } from "date-fns";

export default function DateRangePopover({
  onChange,
  onReset,
  buttonClassName,
}: {
  onChange: (since: string, until: string, label: string) => void;
  onReset: () => void;
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  // 🟢 Persist the last applied values
  const [label, setLabel] = useState("Last 30 Days");
  const [range, setRange] = useState({
    startDate: addDays(new Date(), -30),
    endDate: new Date(),
    label: "Last 30 Days",
  });

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleApply = (since: string, until: string, newLabel: string) => {
    setLabel(newLabel || `${since} → ${until}`);
    setRange({
      startDate: new Date(since),
      endDate: new Date(until),
      label: newLabel || "Custom",
    });
    onChange(since, until, newLabel);
    setOpen(false);
  };

  const handleReset = () => {
    const allTimeStart = addDays(new Date(), -3650);
    setLabel("All Time");
    setRange({
      startDate: allTimeStart,
      endDate: new Date(),
      label: "All Time",
    });
    onReset();
    setOpen(false);
  };

  return (
    <div className="relative inline-block" ref={wrapperRef}>
      <button
        onMouseDown={(e) => e.stopPropagation()}
        onClick={() => setOpen((o) => !o)}
        className={
          buttonClassName ??
          "flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-100"
        }
      >
        <span className="text-gray-700">{label}</span>
        <svg
          className={`h-4 w-4 text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className="absolute right-0 z-50 mt-2 w-[720px] max-w-full rounded-2xl border border-gray-200 bg-white shadow-xl"
        >
          <div className="p-3">
            {/* 🔑 Pass the saved range back in */}
            <DateRangeFilter
              initialRange={range}
              onApply={handleApply}
              onReset={handleReset}
            />
          </div>
        </div>
      )}
    </div>
  );
}
