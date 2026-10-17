import uuid
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request

CORRELATION_ID_HEADER = "X-Correlation-ID"

class CorrelationIdFilter(logging.Filter):
    """Custom logging filter to inject correlation ID into log records."""
    def __init__(self, correlation_id_provider):
        super().__init__()
        self.correlation_id_provider = correlation_id_provider

    def filter(self, record: logging.LogRecord) -> bool:
        record.correlation_id = self.correlation_id_provider.get() or "N/A"
        return True

# Context variable to store current correlation ID per request context
from contextvars import ContextVar
_correlation_id_var: ContextVar[str] = ContextVar("correlation_id", default="")

class CorrelationIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        correlation_id = request.headers.get(CORRELATION_ID_HEADER)
        if not correlation_id:
            correlation_id = str(uuid.uuid4())

        token = _correlation_id_var.set(correlation_id)
        
        response = await call_next(request)
        response.headers[CORRELATION_ID_HEADER] = correlation_id
        
        _correlation_id_var.reset(token)
        return response

def get_current_correlation_id() -> str:
    return _correlation_id_var.get()
