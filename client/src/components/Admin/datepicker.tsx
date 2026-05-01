import React from "react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { isPastDateIST, istToUTC } from "@/lib/timezone";

interface DatePickerProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
  label: string;
  id: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onChange, label, id }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);
  
  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Format date as IST with timezone indicator
  const formatDateForDisplay = (date: Date) => {
    return new Date(date).toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short'
    }) + ' IST';
  };

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get day of week for the first day of the month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Check if date is in the past (comparing against IST midnight)
  const isPastDate = (date: Date) => {
    return isPastDateIST(date);
  };

  // Navigate to previous month
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Handle date selection and set to midnight IST (UTC+5:30)
  const selectDate = (day: number) => {
    // Create date at midnight IST
    const istDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    istDate.setHours(0, 0, 0, 0); // Set to midnight IST

    // Convert IST date to UTC for storage
    const utcDate = istToUTC(istDate);
    if (utcDate) {
      onChange(utcDate);
    }
    setShowCalendar(false);
  };

  // Generate calendar days
  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const days = [];
    const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    
    // Add weekday headers
    weekdays.forEach(day => {
      days.push(
        <div key={`header-${day}`} className="flex h-8 w-8 items-center justify-center text-xs font-medium text-muted-foreground">
          {day}
        </div>
      );
    });
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isSelected = selectedDate.getDate() === day && 
                          selectedDate.getMonth() === month && 
                          selectedDate.getFullYear() === year;
      const isDisabled = isPastDate(date);
      
      days.push(
        <div
          key={`day-${day}`}
          className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-sm transition-colors
            ${isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
            ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
          onClick={() => !isDisabled && selectDate(day)}
        >
          {day}
        </div>
      );
    }
    
    return days;
  };

  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="flex items-center text-lg font-medium text-foreground"
      >
        <CalendarIcon className="mr-2 h-5 w-5" />
        {label}
      </Label>
      <div className="relative" ref={calendarRef}>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between border-gray-600 bg-card text-left font-normal text-foreground"
          onClick={() => setShowCalendar(!showCalendar)}
        >
          <span>{formatDateForDisplay(selectedDate)}</span>
          <CalendarIcon className="h-4 w-4 opacity-50" />
        </Button>
        <AnimatePresence>
          {showCalendar && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 mt-1 w-full rounded-md border border-gray-600 bg-popover p-3 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 bg-transparent p-0"
                  onClick={previousMonth}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-sm font-medium">
                  {currentMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 bg-transparent p-0"
                  onClick={nextMonth}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 grid grid-cols-7 gap-1">
                {renderCalendarDays()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <input
          id={id}
          type="hidden"
          name={id}
          value={selectedDate.toISOString()}
        />
        
        <div className="mt-1 text-sm text-muted-foreground">
          Challenge will be posted at: {formatDateForDisplay(selectedDate)}
        </div>
      </div>
    </div>
  );
};

export default DatePicker;