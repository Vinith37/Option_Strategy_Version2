import * as React from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { cn } from "./ui/utils";

interface FormInputProps extends React.ComponentProps<"input"> {
  label: string;
  id: string;
  helperText?: string;
  error?: string;
  isOptional?: boolean;
}

export function FormInput({ 
  label, 
  id, 
  helperText, 
  error, 
  isOptional,
  className,
  ...props 
}: FormInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm text-gray-700 block">
        {label}
        {isOptional && (
          <span className="text-gray-400 text-xs ml-2">(Optional)</span>
        )}
      </Label>
      <Input
        id={id}
        className={cn(
          "h-11 rounded-lg bg-gray-50/50 border-gray-200 focus:bg-white transition-colors",
          error && "border-red-300 focus:border-red-500",
          className
        )}
        {...props}
      />
      {helperText && !error && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
