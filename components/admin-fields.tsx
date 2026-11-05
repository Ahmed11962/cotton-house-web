import { randomUUID } from 'node:crypto';
export function Field({
  name,
  label,
  value = '',
  type = 'text',
  required = false,
  area = false,
}: {
  name: string;
  label: string;
  value?: string | number;
  type?: string;
  required?: boolean;
  area?: boolean;
}) {
  const id = `field-${name}-${randomUUID()}`;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {area ? (
        <textarea
          id={id}
          name={name}
          defaultValue={value}
          rows={4}
          required={required}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          defaultValue={value}
          required={required}
          step={type === 'number' ? '0.01' : undefined}
          min={type === 'number' ? 0 : undefined}
        />
      )}
    </div>
  );
}
export function Check({
  name,
  label,
  checked = false,
}: {
  name: string;
  label: string;
  checked?: boolean;
}) {
  return (
    <label className="check">
      <input type="checkbox" name={name} defaultChecked={checked} />
      {label}
    </label>
  );
}
export function Notice({ error, saved }: { error?: string; saved?: string }) {
  return (
    <>
      {error && (
        <p className="notice error" role="alert">
          {error === 'inuse'
            ? 'Move the products and subcategories before deleting this category.'
            : error === 'cycle'
              ? 'A category cannot be its own ancestor.'
              : error === 'save'
                ? 'Could not save. Check that the SKU and URL slug are unique and the category still exists.'
                : 'Check all required fields, URLs, and price settings, then try again.'}
        </p>
      )}
      {saved && (
        <p className="notice" role="status">
          Changes saved.
        </p>
      )}
    </>
  );
}
