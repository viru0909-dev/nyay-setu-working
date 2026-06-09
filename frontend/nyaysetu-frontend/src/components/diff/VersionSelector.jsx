export default function VersionSelector({
    label,
    versions,
    selected,
    onChange
}) {
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
                    background: '#111827',
                    color: 'white',
                    border: '1px solid #374151'
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