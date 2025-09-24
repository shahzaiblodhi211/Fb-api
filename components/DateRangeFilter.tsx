"use client";

import { useState, useEffect } from "react";
import { DateRange } from "react-date-range";
import {
  addDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  isSameDay,
} from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const PRESETS = [
  { label: "Today",       range: { startDate: new Date(), endDate: new Date() } },
  { label: "Last 7 Days", range: { startDate: addDays(new Date(), -6),  endDate: new Date() } },
  { label: "Last 14 Days",range: { startDate: addDays(new Date(), -13), endDate: new Date() } },
  { label: "Last 30 Days",range: { startDate: addDays(new Date(), -29), endDate: new Date() } },
  { label: "This Week",   range: { startDate: startOfWeek(new Date(), { weekStartsOn: 1 }), endDate: new Date() } },
  { label: "This Month",  range: { startDate: startOfMonth(new Date()), endDate: new Date() } },
  {
    label: "Last Month",
    range: {
      startDate: startOfMonth(addDays(new Date(), -30)),
      endDate: endOfMonth(addDays(new Date(), -30)),
    },
  },
  { label: "All Time",    range: { startDate: addDays(new Date(), -3650), endDate: new Date() } },
];

export default function DateRangeFilter({
  onApply,
  onReset,
  initialRange,
}: {
  onApply: (since: string, until: string, label: string) => void;
  onReset: () => void;
  initialRange?: {
    startDate: Date;
    endDate: Date;
    label: string;
  };
}) {
  const [range, setRange] = useState([
    {
      startDate: initialRange?.startDate ?? addDays(new Date(), -30),
      endDate: initialRange?.endDate ?? new Date(),
      key: "selection",
    },
  ]);
  const [activePreset, setActivePreset] = useState(
    initialRange?.label ?? "Last 30 Days"
  );

  // 🟢 If parent updates initialRange while popover is reopened
  useEffect(() => {
    if (initialRange) {
      setRange([{ ...initialRange, key: "selection" }]);
      setActivePreset(initialRange.label);
    }
  }, [initialRange]);

  const matchPreset = (start: Date, end: Date): string | null => {
    for (const p of PRESETS) {
      if (
        isSameDay(p.range.startDate, start) &&
        isSameDay(p.range.endDate, end)
      ) {
        return p.label;
      }
    }
    return null;
  };

  const apply = () => {
    const { startDate, endDate } = range[0];
    onApply(
      startDate.toISOString().slice(0, 10),
      endDate.toISOString().slice(0, 10),
      activePreset || "Custom"
    );
  };

  const selectPreset = (preset: { startDate: Date; endDate: Date }, label: string) => {
    setRange([{ ...preset, key: "selection" }]);
    setActivePreset(label);
  };

  return (
    <div className="mx-auto w-[1020px] rounded-2xl bg-white">
      <div className="flex items-center justify-between border-b  bg-white border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-800">Select Date Range</h2>
        <span className="text-sm text-gray-500">{activePreset}</span>
      </div>

      <div className="flex w-full">
        {/* Presets */}
        <aside className="min-w-[220px] max-w-[220px] border-r border-gray-200 bg-white">
          <ul className="py-4 text-sm">
            {PRESETS.map((p) => (
              <li
                key={p.label}
                onClick={() => selectPreset(p.range, p.label)}
                className={`cursor-pointer px-5 py-2.5 transition-colors ${
                  activePreset === p.label
                    ? "bg-blue-600 text-white"
                    : "hover:bg-blue-100"
                }`}
              >
                {p.label}
              </li>
            ))}
          </ul>
        </aside>

        {/* Calendar */}
        <main className="flex-1 bg-white p-6">
          <DateRange
            ranges={range}
            onChange={(item) => {
              const sel = item.selection;
              setRange([sel]);
              const found = matchPreset(sel.startDate, sel.endDate);
              setActivePreset(found ?? "Custom");
            }}
            months={2}
            direction="horizontal"
            moveRangeOnFirstSelection={false}
            showDateDisplay={false}
            rangeColors={["#2563eb"]}
          />

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => {
                setActivePreset("All Time");
                onReset();
              }}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Reset
            </button>
            <button
              onClick={apply}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
