"""
auth.py — JWT token verification for NLP Orchestrator.

Validates JWT tokens issued by the Spring Boot backend (same JWT_SECRET).
Provides a FastAPI dependency (verify_token) that can be injected into
any endpoint to enforce authentication.
"""

import logging
import os
from datetime import datetime, timezone
from typing import Optional

import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

load_dotenv()

logger = logging.getLogger("nlp-orchestrator.auth")

JWT_SECRET: str = os.getenv("JWT_SECRET", "")
JWT_ALGORITHM: str = "HS256"

security = HTTPBearer(auto_error=False)


class TokenPayload:
    """Minimal parsed token payload with user identity."""

    def __init__(self, sub: str, role: Optional[str] = None, email: Optional[str] = None):
        self.sub = sub
        self.role = role
        self.email = email


def verify_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[TokenPayload]:
    """
    FastAPI dependency that validates the Bearer JWT token.

    Returns a TokenPayload on success, or None if no token is provided
    (for endpoints that allow optional auth). Raises 401 on invalid tokens.
    """
    if credentials is None:
        return None

    token = credentials.credentials
    if not token:
        return None

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        logger.warning("Expired JWT token rejected")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as exc:
        logger.warning("Invalid JWT token rejected: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    sub: str = payload.get("sub") or payload.get("id") or ""
    role: Optional[str] = payload.get("role")
    email: Optional[str] = payload.get("email") or payload.get("sub")

    return TokenPayload(sub=str(sub), role=role, email=email)


def require_auth(
    token: Optional[TokenPayload] = Depends(verify_token),
) -> TokenPayload:
    """
    FastAPI dependency that requires a valid JWT token.

    Use this instead of verify_token for endpoints that MUST be authenticated.
    Raises 401 immediately if no token is present.
    """
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a valid JWT token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token
