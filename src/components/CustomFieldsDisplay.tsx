import type { CustomFieldValueDto } from "@/lib/custom-field";

interface CustomFieldsDisplayProps {
  fields: CustomFieldValueDto[];
}

export function CustomFieldsDisplay({ fields }: CustomFieldsDisplayProps) {
  if (fields.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
      <div className="px-4 py-3">
        <h2 className="text-sm font-medium text-slate-700">Дополнительные поля</h2>
      </div>
      {fields.map((field) => (
        <div key={field.id} className="px-4 py-3.5">
          <p className="text-xs font-medium text-slate-400">{field.label}</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-800">{field.value}</p>
        </div>
      ))}
    </section>
  );
}
