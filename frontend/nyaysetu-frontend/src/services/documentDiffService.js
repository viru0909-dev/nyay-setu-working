import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc =
    `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function extractTextFromFile(file) {
    const extension =
        file.name.split('.').pop().toLowerCase();

    if (extension === 'txt') {
        return await file.text();
    }

    if (extension === 'docx') {
        const buffer = await file.arrayBuffer();

        const result =
            await mammoth.extractRawText({
                arrayBuffer: buffer
            });

        return result.value;
    }

    if (extension === 'pdf') {
        const buffer = await file.arrayBuffer();

        const pdf =
            await pdfjsLib.getDocument({
                data: buffer
            }).promise;

        let text = '';

        for (
            let pageNum = 1;
            pageNum <= pdf.numPages;
            pageNum++
        ) {
            const page =
                await pdf.getPage(pageNum);

            const content =
                await page.getTextContent();

            text += content.items
                .map((item) => item.str)
                .join(' ');
        }

        return text;
    }

    throw new Error('Unsupported file type');
}