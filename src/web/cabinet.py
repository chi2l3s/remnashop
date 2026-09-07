from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles


def mount_cabinet(app: FastAPI) -> None:
    """Serve the built Mini App on the API origin, retaining secure session cookies."""
    directory = Path(__file__).parent / "static" / "cabinet"
    if not (directory / "index.html").is_file():
        return

    @app.get("/cabinet", include_in_schema=False)
    async def cabinet_redirect() -> RedirectResponse:
        return RedirectResponse("/cabinet/")

    app.mount("/cabinet", StaticFiles(directory=directory, html=True), name="cabinet")
