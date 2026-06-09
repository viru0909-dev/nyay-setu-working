import { useState } from 'react';

export default function FileUploadPanel({
    label,
    onFileSelect
}) {
    const [fileName, setFileName] = useState('');

    const handleChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        setFileName(file.name);
        onFileSelect(file);
    };

    return (
        <div
            style={{
                flex: 1,
                border: '1px solid #374151',
                borderRadius: '12px',
                padding: '1rem',
                background: '#111827'
            }}
        >
            <h3>{label}</h3>

            <input
                type="file"
                accept=".txt,.pdf,.docx"
                onChange={handleChange}
            />

            {fileName && (
                <p
                    style={{
                        marginTop: '0.75rem',
                        color: '#9CA3AF'
                    }}
                >
                    {fileName}
                </p>
            )}
        </div>
    );
}