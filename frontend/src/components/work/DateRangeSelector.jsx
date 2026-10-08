import { RANGE_PRESETS, resolvePreset } from '../../lib/work.js'

export default function DateRangeSelector({ value, onChange }) {
  const updateManual = (side, dateValue) => {
    const next = { ...value }
    if (side === 'from') {
      next.from = dateValue
      if (next.to && dateValue > next.to) next.to = dateValue
    } else {
      next.to = dateValue
      if (next.from && dateValue < next.from) next.from = dateValue
    }
    onChange({ ...next, preset: 'custom' })
  }

  const applyPreset = (preset) => {
    if (preset === 'custom') return
    const range = resolvePreset(preset)
    onChange({ ...range, preset, label: undefined })
  }

  return (
    <div className="daterange">
      <div className="daterange__presets" role="group" aria-label="Rangos rápidos">
        {RANGE_PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            className={`chip${value.preset === preset.value ? ' chip--active' : ''}`}
            onClick={() => applyPreset(preset.value)}
            aria-pressed={value.preset === preset.value}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="daterange__inputs">
        <div className="field">
          <label className="field__label" htmlFor="range-from">
            Desde
          </label>
          <input
            id="range-from"
            className="input"
            type="date"
            value={value.from}
            onChange={(event) => updateManual('from', event.target.value)}
          />
        </div>
        <span className="daterange__sep" aria-hidden="true">
          →
        </span>
        <div className="field">
          <label className="field__label" htmlFor="range-to">
            Hasta
          </label>
          <input
            id="range-to"
            className="input"
            type="date"
            value={value.to}
            onChange={(event) => updateManual('to', event.target.value)}
          />
        </div>
      </div>
    </div>
  )
}