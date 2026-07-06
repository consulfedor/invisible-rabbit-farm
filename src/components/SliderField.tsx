type SliderFieldProps = {
  id: string
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
}

export const SliderField = ({ id, label, value, min = 0, max = 1, step = 0.01, onChange }: SliderFieldProps) => (
  <label className="slider-field">
    <span>
      {label}
      <b>{value.toFixed(step >= 1 ? 0 : 2)}</b>
    </span>
    <input
      id={id}
      name={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  </label>
)
