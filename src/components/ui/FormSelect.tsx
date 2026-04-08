'use client'

import { ChevronDown } from 'lucide-react'
import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react'

interface FormSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  children: ReactNode
  className?: string
  /** Use a light cream background (default) or plain white */
  variant?: 'cream' | 'white'
}

/**
 * Consistent dropdown primitive — native <select> with guaranteed behavior
 * on iOS Safari, Android Chrome, and desktop browsers.
 *
 * Why this exists:
 *   - iOS Safari ignores `py-X` padding on bare <select> and collapses it to
 *     line-height (~19px tall), making the tap target unreachable. We set
 *     `min-height: 48px` and explicit padding to guarantee a reliable target.
 *   - We need a visible chevron since `appearance: none` removes the default
 *     arrow. The chevron is positioned absolutely and marked pointer-events:
 *     none so taps still hit the underlying select.
 *   - Every form in the app (vendor signup, vendor onboarding, dashboard edit,
 *     contact, etc.) should use THIS instead of a raw <select> so styling and
 *     behavior stay consistent.
 */
const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ children, className = '', variant = 'cream', ...props }, ref) => {
    const bg = variant === 'cream' ? 'bg-[#FAFAF7]' : 'bg-white'
    return (
      <div className="relative">
        <select
          ref={ref}
          {...props}
          className={`
            w-full
            appearance-none
            min-h-[48px]
            pl-4 pr-11 py-3
            text-sm
            text-[#1A1A1A]
            border border-gray-200 rounded-xl
            ${bg}
            outline-none
            transition-colors
            focus:border-[#C8A96A]
            cursor-pointer
            ${className}
          `}
          style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          aria-hidden="true"
        />
      </div>
    )
  }
)

FormSelect.displayName = 'FormSelect'

export default FormSelect
