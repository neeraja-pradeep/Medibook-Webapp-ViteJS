interface SettlementDateInputProps {
  value: string;
  onChange: (value: string) => void;
  title: string;
}

/** Native date input styled like the design's expected-date range filters. */
export function SettlementDateInput({ value, onChange, title }: SettlementDateInputProps) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      title={title}
      className="border-border rounded-input text-body text-text-body h-11 border bg-white px-3"
    />
  );
}
