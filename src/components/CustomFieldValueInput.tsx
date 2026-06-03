import type { CustomFieldDefinitionDto } from "@/lib/custom-field";
import { Input } from "@/components/ui/Input";

interface CustomFieldValueInputProps {
  definition: CustomFieldDefinitionDto | undefined;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  autoFocus?: boolean;
}

const selectClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

export function CustomFieldValueInput({
  definition,
  value,
  onChange,
  label = "Значение",
  autoFocus,
}: CustomFieldValueInputProps) {
  if (definition?.fieldType === "enum" && definition.options.length > 0) {
    return (
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">{label}</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={selectClassName}
          autoFocus={autoFocus}
        >
          {definition.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <Input
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Введите значение..."
      autoFocus={autoFocus}
    />
  );
}

export function defaultValueForDefinition(definition: CustomFieldDefinitionDto | undefined): string {
  if (definition?.fieldType === "enum" && definition.options.length > 0) {
    return definition.options[0];
  }
  return "";
}
