"""URL validation helpers for server-side media fetches."""

import ipaddress
import socket
from typing import Set, Union
from urllib.parse import urlparse


BLOCKED_HOSTNAMES = {"localhost", "localhost.localdomain"}
ALLOWED_SCHEMES = {"http", "https"}


class UnsafeVideoUrlError(ValueError):
    """Raised when a forensics video URL is unsafe for server-side fetches."""


def validate_public_video_url(url: str) -> str:
    """
    Validate a remote video URL before the server downloads it.

    The forensics pipeline fetches videos server-side, so it must reject URLs
    that can reach loopback, private networks, link-local ranges, multicast
    ranges, or cloud metadata endpoints.
    """
    candidate = url.strip()
    parsed = urlparse(candidate)

    if parsed.scheme.lower() not in ALLOWED_SCHEMES:
        raise UnsafeVideoUrlError("Only http and https video URLs are supported.")

    if not parsed.hostname:
        raise UnsafeVideoUrlError("Video URL must include a hostname.")

    hostname = parsed.hostname.rstrip(".").lower()
    if hostname in BLOCKED_HOSTNAMES:
        raise UnsafeVideoUrlError("Localhost video URLs are not allowed.")

    for address in _resolve_host_addresses(hostname):
        if _is_blocked_address(address):
            raise UnsafeVideoUrlError("Video URL resolves to a private or reserved address.")

    return candidate


IPAddress = Union[ipaddress.IPv4Address, ipaddress.IPv6Address]


def _resolve_host_addresses(hostname: str) -> Set[IPAddress]:
    addresses = set()

    try:
        addresses.add(ipaddress.ip_address(hostname))
        return addresses
    except ValueError:
        pass

    try:
        results = socket.getaddrinfo(hostname, None, type=socket.SOCK_STREAM)
    except socket.gaierror as exc:
        raise UnsafeVideoUrlError("Video URL hostname could not be resolved.") from exc

    for family, *_rest, sockaddr in results:
        if family not in (socket.AF_INET, socket.AF_INET6):
            continue
        addresses.add(ipaddress.ip_address(sockaddr[0]))

    if not addresses:
        raise UnsafeVideoUrlError("Video URL hostname did not resolve to an IP address.")

    return addresses


def _is_blocked_address(address: IPAddress) -> bool:
    return any(
        (
            address.is_private,
            address.is_loopback,
            address.is_link_local,
            address.is_multicast,
            address.is_reserved,
            address.is_unspecified,
        )
    )
