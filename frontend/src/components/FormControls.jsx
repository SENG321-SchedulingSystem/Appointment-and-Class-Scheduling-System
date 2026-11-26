// Shared form pieces used by the Login and Admin screens (Figma style).

const inputClass = (error) =>
  `mt-2 w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0F2A4A]/20 ${
    error ? 'border-[#FCA5A5]' : 'border-[#DCE4EF]'
  }`

export function Field({ id, label, error, onChange, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-800">
        {label}
      </label>
      <input
        id={id}
        {...inputProps}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={inputClass(error)}
      />
      <FieldError id={id} error={error} />
    </div>
  )
}

export function SelectField({ id, label, error, onChange, children, ...selectProps }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-800">
        {label}
      </label>
      <select
        id={id}
        {...selectProps}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={inputClass(error)}
      >
        {children}
      </select>
      <FieldError id={id} error={error} />
    </div>
  )
}

function FieldError({ id, error }) {
  if (!error) return null
  return (
    <div id={`${id}-error`} className="mt-2">
      <ErrorBox>{error}</ErrorBox>
    </div>
  )
}

export function ErrorBox({ children }) {
  return (
    <div role="alert" className="flex items-center gap-2 rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
      </svg>
      <span>{children}</span>
    </div>
  )
}

export function SuccessBox({ children }) {
  return (
    <div role="status" className="flex items-center gap-2 rounded-lg bg-[#ECFDF5] px-4 py-3 text-sm text-[#047857]">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0">
        <circle cx="12" cy="12" r="10" />
        <path d="m8 12 3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>{children}</span>
    </div>
  )
}

export function PrimaryButton({ loading, loadingText, children, ...props }) {
  return (
    <button
      type="submit"
      disabled={loading}
      {...props}
      className={`rounded-lg bg-[#0F2A4A] px-6 py-3 text-sm font-medium text-white hover:bg-[#0B1F38] disabled:cursor-not-allowed disabled:opacity-60 ${
        props.className || ''
      }`}
    >
      {loading ? loadingText : children}
    </button>
  )
}
