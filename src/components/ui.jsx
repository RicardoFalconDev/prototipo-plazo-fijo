import { useEffect, useRef, useState } from 'react';

// Material icons (mismos paths que la página Íconos de Figma)
const PATHS = {
  'arrow-back': 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z',
  help: 'M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z',
  close: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  'chevron-right': 'M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z',
  check: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
  'check-circle': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
  info: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
  error: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
  warning: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
  calendar: 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z',
  'trending-up': 'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z',
  schedule: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z',
};

export function Icon({ name, size = 24, color = 'var(--color-icon-primary)', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flex: 'none', ...style }}>
      <path d={PATHS[name]} fill={color} />
    </svg>
  );
}

export function AppBar({ title, onBack, onHelp, onClose }) {
  return (
    <header className="appbar">
      {onBack ? (
        <button className="icon-btn" onClick={onBack} aria-label="Volver"><Icon name="arrow-back" color="var(--color-icon-brand)" /></button>
      ) : <span className="icon-btn" />}
      <h1 className="appbar-title t-title-md">{title}</h1>
      {onHelp ? (
        <button className="icon-btn" onClick={onHelp} aria-label="¿Qué es un plazo fijo?"><Icon name="help" color="var(--color-icon-brand)" /></button>
      ) : onClose ? (
        <button className="icon-btn" onClick={onClose} aria-label="Cerrar"><Icon name="close" color="var(--color-icon-brand)" /></button>
      ) : <span className="icon-btn" />}
    </header>
  );
}

export function Button({ children, variant = 'primary', disabled, loading, onClick, icon }) {
  return (
    <button className={`btn btn-${variant}`} disabled={disabled || loading} onClick={onClick} aria-busy={loading || undefined}>
      {loading ? <span className="spinner" aria-hidden="true" /> : icon}
      <span className="t-label-lg">{loading ? 'Procesando…' : children}</span>
    </button>
  );
}

export function CurrencySelector({ value, onChange }) {
  return (
    <div className="segmented" role="radiogroup" aria-label="Moneda">
      {[['ARS', 'Pesos'], ['USD', 'Dólares']].map(([k, l]) => (
        <button key={k} role="radio" aria-checked={value === k} className={`segment t-label-lg ${value === k ? 'on' : ''}`} onClick={() => onChange(k)}>{l}</button>
      ))}
    </div>
  );
}

export function Tag({ tone = 'exito', children, icon }) {
  return (
    <span className={`tag tag-${tone} t-label-md`}>
      {icon && <Icon name={icon} size={16} color="currentColor" />}
      {children}
    </span>
  );
}

export function Alert({ tone = 'info', title, children }) {
  const icon = { info: 'info', exito: 'check-circle', advertencia: 'warning', error: 'error' }[tone];
  return (
    <div className={`alert alert-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon name={icon} size={20} color="currentColor" />
      <div className="alert-text">
        {title && <p className="t-label-lg c-primary">{title}</p>}
        <p className="t-body-md c-secondary">{children}</p>
      </div>
    </div>
  );
}

export function SelectField({ label, value, action = 'Cambiar', onClick, empty }) {
  return (
    <button className="select-field" onClick={onClick}>
      <span className="select-data">
        <span className="t-body-sm c-tertiary">{label}</span>
        <span className={`t-body-lg ${empty ? 'c-tertiary' : 'c-primary'}`}>{value}</span>
      </span>
      <span className="pill t-label-md">{action}</span>
    </button>
  );
}

export function AmountField({ label, value, onChange, onBlur, error, help, simbolo, disabled, inputRef }) {
  const [focus, setFocus] = useState(false);
  const state = disabled ? 'disabled' : error ? 'error' : focus ? 'focus' : 'default';
  return (
    <div className="field">
      <label className="t-title-md c-primary" htmlFor="monto">{label}</label>
      <div className={`amount-box is-${state}`}>
        <span className={`t-display-input ${value ? 'c-primary' : 'c-tertiary'}`}>{simbolo}</span>
        <input
          id="monto" ref={inputRef} className="t-display-input" inputMode="numeric" autoComplete="off" placeholder="0"
          value={value} disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => { setFocus(false); onBlur && onBlur(); }}
          aria-invalid={!!error} aria-describedby="monto-ayuda"
        />
      </div>
      <p id="monto-ayuda" className={`help t-body-sm ${error ? 'c-error' : 'c-tertiary'}`} aria-live="polite">
        {error && <Icon name="error" size={16} color="var(--color-icon-error)" />}
        {error || help}
      </p>
    </div>
  );
}

export function TermChip({ selected, disabled, onClick, children, sub }) {
  return (
    <button className={`chip ${selected ? 'on' : ''}`} aria-pressed={selected} disabled={disabled} onClick={onClick}>
      {children}
      {sub && <span className="t-label-md">{sub}</span>}
    </button>
  );
}

export function Radio({ on }) {
  return <span className={`radio ${on ? 'on' : ''}`} aria-hidden="true" />;
}

export function ListOption({ selected, title, description, tags, onClick, divider = true }) {
  return (
    <button className={`list-option ${divider ? 'divider' : ''}`} role="radio" aria-checked={selected} onClick={onClick}>
      <Radio on={selected} />
      <span className="list-text">
        <span className="t-title-md c-primary">{title}</span>
        <span className="t-body-md c-secondary">{description}</span>
        {tags && <span className="tags">{tags.map(([t, l]) => <Tag key={l} tone={t}>{l}</Tag>)}</span>}
      </span>
    </button>
  );
}

export function DataRow({ label, value, emphasis = 'normal', last, children }) {
  return (
    <div className={`data-row ${last ? '' : 'divider'}`}>
      <span className="t-body-md c-secondary">{label}</span>
      {emphasis === 'loading' ? <span className="skeleton" /> : children || (
        <span className={emphasis === 'normal' ? 't-body-lg c-primary' : emphasis === 'positive' ? 't-title-md c-success' : 't-title-md c-primary'}>{value}</span>
      )}
    </div>
  );
}

export function EditableRow({ label, value, onEdit, last }) {
  return (
    <div className={`data-row editable ${last ? '' : 'divider'}`}>
      <span className="select-data">
        <span className="t-body-sm c-tertiary">{label}</span>
        <span className="t-body-lg c-primary">{value}</span>
      </span>
      {onEdit && <button className="pill t-label-md" onClick={onEdit}>Editar</button>}
    </div>
  );
}

export function AccountCard({ selected, disabled, name, balance, note, onClick }) {
  return (
    <button className={`account ${selected ? 'on' : ''}`} role="radio" aria-checked={selected} disabled={disabled} onClick={onClick}>
      <Radio on={selected} />
      <span className="select-data">
        <span className="t-body-md c-secondary">{name}</span>
        <span className="t-title-lg c-primary">{balance}</span>
        {note && <span className="t-body-sm c-error">{note}</span>}
      </span>
    </button>
  );
}

export function Card({ children, className = '', ...rest }) {
  return <div className={`card ${className}`} {...rest}>{children}</div>;
}

export function EmptyState({ title, description, illustration, action, onAction }) {
  return (
    <div className="card empty">
      {illustration && <img src={`${import.meta.env.BASE_URL}ilustracion-ahorro.svg`} width="72" height="77" alt="" />}
      <p className="t-title-md c-primary">{title}</p>
      <p className="t-body-md c-secondary">{description}</p>
      {action && <Button onClick={onAction}>{action}</Button>}
    </div>
  );
}

export function BottomSheet({ open, title, onClose, children, actions }) {
  const ref = useRef(null);
  useEffect(() => { if (open && ref.current) ref.current.focus(); }, [open]);
  if (!open) return null;
  return (
    <div className="sheet-layer">
      <div className="scrim" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}>
        <div className="grabber" aria-hidden="true" />
        {title && <h2 className="t-title-lg c-primary">{title}</h2>}
        <div className="sheet-body">{children}</div>
        {actions && <div className="sheet-actions">{actions}</div>}
      </div>
    </div>
  );
}

export function Screen({ header, children, footer, bg }) {
  const scrollRef = useRef(null);
  const [scrolls, setScrolls] = useState(false);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => setScrolls(el.scrollHeight - el.scrollTop - el.clientHeight > 2);
    check();
    el.addEventListener('scroll', check);
    const ro = new ResizeObserver(check);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => { el.removeEventListener('scroll', check); ro.disconnect(); };
  }, []);
  return (
    <div className={`screen ${bg || ''}`}>
      {header}
      <main className="content" ref={scrollRef}><div className="content-inner">{children}</div></main>
      {footer && <footer className={`actionbar ${scrolls ? 'raised' : ''}`}>{footer}</footer>}
    </div>
  );
}
