/**
 * Displays document version metadata from backend DocumentVersion / DocumentDto.
 * Supports both uploadedBy (backend) and uploaderName (upload response) fields.
 */
export default function DocumentMetadataPanel({
    title,
    metadata
}) {
    if (!metadata) return null;

    const uploader =
        metadata.uploaderName ||
        metadata.uploadedBy ||
        'Unknown';

    const uploadedAt = metadata.uploadedAt
        ? new Date(metadata.uploadedAt).toLocaleDateString(
              'en-GB',
              {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
              }
          )
        : 'Unknown';

    return (
        <div
            style={{
                flex: '1 1 280px',
                padding: '1rem',
                border: '1px solid #374151',
                borderRadius: '12px',
                background: '#0f172a'
            }}
        >
            <h3
                style={{
                    color: '#ffffff',
                    marginBottom: '1rem'
                }}
            >
                {title}
            </h3>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    color: '#d1d5db',
                    fontSize: '0.95rem'
                }}
            >
                <div>
                    <strong>Uploaded By:</strong> {uploader}
                </div>

                <div>
                    <strong>Uploaded At:</strong> {uploadedAt}
                </div>

                <div
                    style={{
                        wordBreak: 'break-all'
                    }}
                >
                    <strong>SHA-256:</strong>{' '}
                    {metadata.fileHash
                        ? `${metadata.fileHash.substring(0, 20)}...`
                        : 'Unavailable'}
                </div>

                <div>
                    <strong>Integrity:</strong>{' '}
                    {metadata.isVerified
                        ? 'Verified'
                        : 'Not Verified'}
                </div>
            </div>
        </div>
    );
}
