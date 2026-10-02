import type { Ref } from "react";

export const COUNTRY_OPTIONS = [
  "India",
  "Australia",
  "Brazil",
  "Canada",
  "France",
  "Germany",
  "Japan",
  "Netherlands",
  "Singapore",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
];

type CountrySelectProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  invalid: boolean;
  describedBy?: string;
  selectRef: Ref<HTMLSelectElement>;
};

export function CountrySelect({ id, value, onChange, onBlur, invalid, describedBy, selectRef }: CountrySelectProps) {
  return (
    <div className="relative">
      <select
        id={id}
        name="country"
        ref={selectRef}
        value={value}
        required
        autoComplete="country-name"
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        className="input-control select-control"
      >
        {COUNTRY_OPTIONS.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        aria-hidden="true"
        focusable="false"
        className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
      >
        <path
          d="M4 6.2 8 10.2 12 6.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
