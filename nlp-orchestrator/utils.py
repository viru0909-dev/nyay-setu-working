import asyncio
import logging
from functools import wraps

logger = logging.getLogger(__name__)

def async_retry(max_attempts=3, base_delay=1):

    def decorator(func):

        @wraps(func)
        async def wrapper(*args, **kwargs):

            last_exception = None

            for attempt in range(max_attempts):

                try:
                    return await func(*args, **kwargs)

                except Exception as e:

                    last_exception = e

                    if attempt == max_attempts - 1:
                        raise

                    delay = base_delay * (2 ** attempt)

                    logger.warning(
                        f"Retry attempt {attempt + 1} failed due to: {str(e)}. "
                        f"Retrying in {delay} seconds..."
                    )

                    await asyncio.sleep(delay)

            raise last_exception

        return wrapper

    return decorator