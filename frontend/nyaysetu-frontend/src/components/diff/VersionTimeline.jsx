export default function VersionTimeline({
    versions,
    baseVersion,
    compareVersion,
    onVersionClick
}) {
    const handleClick = (versionId) => {
        if (onVersionClick) {
            onVersionClick(versionId);
        }
    };
    const border_color = '#374151';
    const background_color = '#111827';

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                overflowX: 'auto',
                paddingBottom: '0.5rem'
            }}
        >
            {versions.map((version, index) => {
                const isSelected =
                    version.id === baseVersion ||
                    version.id === compareVersion;

                return (
                    <div
                        key={version.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => handleClick(version.id)}
                            title={
                                onVersionClick
                                    ? 'Click to set as compare version'
                                    : undefined
                            }
                            style={{
                                padding: '0.75rem',
                                borderRadius: '10px',
                                border: isSelected
                                    ? `2px solid #22c55e`
                                    : `1px solid ${border_color}`,
                                background: isSelected
                                    ? '#14532d'
                                    : `${background_color}`,
                                color: '#ffffff',
                                cursor: onVersionClick
                                    ? 'pointer'
                                    : 'default',
                                fontSize: '0.9rem'
                            }}
                        >
                            {version.label || version.id}
                        </button>

                        {index < versions.length - 1 && (
                            <div
                                style={{
                                    width: '40px',
                                    height: '2px',
                                    background: `${border_color}`,
                                    flexShrink: 0
                                }}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
