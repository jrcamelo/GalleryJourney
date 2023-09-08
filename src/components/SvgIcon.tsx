export default function SvgIcon({ name = '', prefix = 'icon', color = '#333', ...props }) {
  const symbolId = `#${prefix}-${name}`;

  return (
    <svg {...props} aria-hidden="true" className="icon">
      <use href={symbolId} fill={color} />
    </svg>
  );
}
