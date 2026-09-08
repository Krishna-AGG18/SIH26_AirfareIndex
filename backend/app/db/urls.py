from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit


def async_database_url(url: str) -> str:
    """Convert a Neon/libpq URL into a URL accepted by SQLAlchemy asyncpg."""
    scheme = url
    if url.startswith("postgresql://"):
        scheme = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgres://"):
        scheme = url.replace("postgres://", "postgresql+asyncpg://", 1)

    parsed = urlsplit(scheme)
    query = []
    for key, value in parse_qsl(parsed.query, keep_blank_values=True):
        if key == "channel_binding":
            continue
        if key == "sslmode":
            key = "ssl"
        query.append((key, value))

    return urlunsplit((parsed.scheme, parsed.netloc, parsed.path, urlencode(query), parsed.fragment))
