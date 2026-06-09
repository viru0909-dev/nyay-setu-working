export default function VersionTimeline({
    versions,
    baseVersion,
    compareVersion
}) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '2rem',
                flexWrap: 'wrap'
            }}
        >
            {versions.map((version, index) => (
                <div
                    key={version.id}
                    style={{
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <div
                        style={{
                            padding: '0.75rem',
                            borderRadius: '10px',
                            border:
                                version.id === baseVersion ||
                                version.id === compareVersion
                                    ? '2px solid #22c55e'
                                    : '1px solid #374151',
                            background:
                                version.id === baseVersion ||
                                version.id === compareVersion
                                    ? '#14532d'
                                    : '#111827'
                        }}
                    >
                        {version.label}
                    </div>

                    {index <
                        versions.length - 1 && (
                        <div
                            style={{
                                width: '40px',
                                height: '2px',
                                background:
                                    '#374151'
                            }}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}