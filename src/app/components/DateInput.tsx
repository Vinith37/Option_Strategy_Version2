import * as React from "react";
import { Calendar as CalendarIcon, Lock } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "./ui/utils";

interface DateInputProps {
  label: string;
  id: string;
  value?: Date;
  onChange: (date?: Date) => void;
  helperText?: string;
  error?: string;
  isOptional?: boolean;
  placeholder?: string;
  disabled?: boolean;
  disabledTooltip?: string;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: (date: Date) => boolean;
}

export function DateInput({
  label,
  id,
  value,
  onChange,
  helperText,
  error,
  isOptional,
  placeholder = "Select date",
  disabled = false,
  disabledTooltip = "This field cannot be edited",
  minDate,
  maxDate,
  disabledDates,
}: DateInputProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  // Default min date: January 1, 2000
  const defaultMinDate = new Date(2000, 0, 1);
  const effectiveMinDate = minDate || defaultMinDate;

  // Sync input value with prop value
  React.useEffect(() => {
    if (value) {
      setInputValue(format(value, "yyyy-MM-dd"));
    } else {
      setInputValue("");
    }
  }, [value]);

  // Function to check if a date should be disabled
  const isDateDisabled = (date: Date): boolean => {
    // Disable dates before 2000
    if (date < defaultMinDate) {
      return true;
    }

    // Apply min/max constraints
    if (minDate && date < minDate) {
      return true;
    }

    if (maxDate && date > maxDate) {
      return true;
    }

    // Apply custom disabled dates function
    if (disabledDates && disabledDates(date)) {
      return true;
    }

    return false;
  };

  // Handle manual input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Try to parse the date as user types
    // Support formats: YYYY-MM-DD, YYYY/MM/DD, DD-MM-YYYY, DD/MM/YYYY
    const formats = ["yyyy-MM-dd", "yyyy/MM/dd", "dd-MM-yyyy", "dd/MM/yyyy"];
    
    for (const fmt of formats) {
      try {
        const parsed = parse(newValue, fmt, new Date());
        if (isValid(parsed) && !isDateDisabled(parsed)) {
          onChange(parsed);
          return;
        }
      } catch {
        // Continue to next format
      }
    }

    // If no valid format, clear the date
    if (newValue === "") {
      onChange(undefined);
    }
  };

  // Handle calendar selection
  const handleCalendarSelect = (date: Date | undefined) => {
    onChange(date);
    setIsOpen(false);
  };

  if (disabled) {
    // Render disabled state without popover
    return (
      <div className="space-y-2">
        <Label htmlFor={id} className="text-sm text-gray-600 block">
          {label}
          {isOptional && (
            <span className="text-gray-400 text-xs ml-2">(Optional)</span>
          )}
        </Label>
        <div
          className={cn(
            "w-full h-11 px-3 flex items-center rounded-lg bg-gray-50 border border-gray-200 cursor-not-allowed transition-all duration-200",
            !value && "text-gray-400"
          )}
          title={disabledTooltip}
        >
          <Lock className="mr-2 h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-600">
            {value ? format(value, "yyyy-MM-dd") : placeholder}
          </span>
        </div>
        {helperText && (
          <p className="text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm text-gray-700 block">
        {label}
        {isOptional && (
          <span className="text-gray-400 text-xs ml-2">(Optional)</span>
        )}
      </Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <div className="relative">
          <input
            id={id}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => {
              // Don't auto-open on focus for mobile devices
              if (window.innerWidth >= 640) {
                // Auto-open calendar on focus for desktop
                // setIsOpen(true);
              }
            }}
            placeholder={placeholder}
            className={cn(
              "w-full h-11 pl-10 pr-3 rounded-lg bg-white border transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              "placeholder:text-gray-400 text-sm text-gray-900",
              "active:scale-[0.995]",
              "touch-manipulation",
              error 
                ? "border-red-300 bg-red-50/30 focus:ring-red-500 focus:border-red-500" 
                : "border-gray-300 hover:border-gray-400"
            )}
          />
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className={cn(
                "absolute left-0 top-0 h-11 w-10 p-0 hover:bg-transparent transition-colors duration-200",
                "flex items-center justify-center",
                "active:scale-95"
              )}
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(!isOpen);
              }}
            >
              <CalendarIcon className={cn(
                "h-4 w-4 transition-colors duration-200",
                isOpen ? "text-blue-600" : "text-gray-500"
              )} />
            </Button>
          </PopoverTrigger>
        </div>
        <PopoverContent 
          className="w-auto p-0 shadow-xl rounded-xl border border-gray-200 bg-white overflow-hidden" 
          align="start"
          sideOffset={8}
          avoidCollisions={true}
          collisionPadding={{ top: 10, right: 10, bottom: 10, left: 10 }}
          onOpenAutoFocus={(e) => {
            // Prevent auto-focus to avoid keyboard popping up on mobile
            e.preventDefault();
          }}
        >
          <div className="max-h-[400px] overflow-y-auto">
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleCalendarSelect}
              disabled={isDateDisabled}
              fromDate={effectiveMinDate}
              toDate={maxDate}
              defaultMonth={value || new Date()}
              className="rounded-xl"
            />
          </div>
        </PopoverContent>
      </Popover>
      {helperText && !error && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
          <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
          {error}
        </p>
      )}
    </div>
  );
}