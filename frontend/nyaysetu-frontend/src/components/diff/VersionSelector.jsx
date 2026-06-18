export default function VersionSelector({
    label,
    versions,
    selected,
    onChange
}) {
    const border_color = '#374151';
    const background_color = '#111827';
    return (
        <div>
            <label
                style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#d1d5db'
                }}
            >
                {label}
            </label>

            <select
                value={selected}
                onChange={(e) =>
                    onChange(e.target.value)
                }
                style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: `${background_color}`,
                    color: 'white',
                    border: `1px solid ${border_color}`
                }}
            >
                {versions.map((version) => (
                    <option
                        key={version.id}
                        value={version.id}
                    >
                        {version.label}
                    </option>
                ))}
            </select>
        </div>
    );
}