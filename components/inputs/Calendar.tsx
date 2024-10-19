"use client";

import React, { useState } from "react";
import { DateRange, Calendar as SingleCalendar, Range, RangeKeyDict } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

type CalendarProps = {
  mode: "single" | "multiple"; // Mode to determine if single or multiple dates
  value: Range | Date; // Can be a Range (multiple) or single Date
  onChange: (value: Range | Date) => void; // Function to handle changes
  disabledDates?: Date[];
};

function Calendar({ mode, value, onChange, disabledDates }: CalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Handle single date selection
  const handleSingleDateChange = (date: Date) => {
    setSelectedDate(date);
    onChange(date);
  };

  // Handle multiple date selection
  const handleRangeChange = (ranges: RangeKeyDict) => {
    const selectedRange = ranges["selection"]; // Access the range with 'selection' key
    onChange(selectedRange); // selectedRange will now be of type 'Range'
  };

  return (
    <>
      {mode === "multiple" ? (
        // Multi-date selection (Range)
        <DateRange
          rangeColors={["#262626"]}
          ranges={[value as Range]} // Cast as Range for multiple
          onChange={handleRangeChange} // Update handle function
          direction="vertical"
          showDateDisplay={false}
          minDate={new Date()}
          disabledDates={disabledDates}
        />
      ) : (
        // Single date selection
        <SingleCalendar
          date={selectedDate || (value as Date)} // Cast as Date for single
          onChange={(date) => handleSingleDateChange(date as Date)}
          minDate={new Date()}
          disabledDates={disabledDates}
        />
      )}
    </>
  );
}

export default Calendar;
