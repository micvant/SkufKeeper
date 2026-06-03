import { Input } from "@/components/ui/Input";

interface CustomFieldInputProps {
  label: string | null | undefined;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CustomFieldInput({ label, value, onChange, placeholder }: CustomFieldInputProps) {
  if (!label?.trim()) return null;

  return (
    <Input
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? "Введите значение..."}
    />
  );
}
