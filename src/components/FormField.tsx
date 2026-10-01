import type { ReactNode } from "react";

type FormFieldProps = {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
};

export function FormField({ id, label, error, required = false, className = "", children }: FormFieldProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`.trim()}>
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">
        {label}
        {required ? (
          <span aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
        {required ? <span className="sr-only"> (required)</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm font-medium leading-snug text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
