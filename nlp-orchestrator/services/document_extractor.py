import os
import io
import logging

try:
    from pdf2image import convert_from_bytes
    import pytesseract
    from PIL import Image
    import docx
except ImportError:
    logging.warning("Optional dependencies for multi-modal extraction missing. Run pip install pytesseract pdf2image python-docx")

class MultiModalExtractor:
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def extract_text(self, file_bytes, file_type):
        """
        Extract text from various document formats: images, Word, scanned PDFs
        """
        try:
            if file_type == 'application/pdf':
                return self._extract_from_pdf(file_bytes)
            elif file_type in ['image/png', 'image/jpeg', 'image/jpg']:
                return self._extract_from_image(file_bytes)
            elif file_type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                return self._extract_from_docx(file_bytes)
            else:
                return file_bytes.decode('utf-8', errors='ignore')
        except Exception as e:
            self.logger.error(f"Error extracting text: {e}")
            return ""

    def _extract_from_image(self, file_bytes):
        image = Image.open(io.BytesIO(file_bytes))
        text = pytesseract.image_to_string(image)
        return text

    def _extract_from_pdf(self, file_bytes):
        # Handle both native and scanned PDFs by rendering pages to images
        images = convert_from_bytes(file_bytes)
        text = ""
        for img in images:
            text += pytesseract.image_to_string(img) + "\n"
        return text

    def _extract_from_docx(self, file_bytes):
        doc = docx.Document(io.BytesIO(file_bytes))
        return "\n".join([para.text for para in doc.paragraphs])
