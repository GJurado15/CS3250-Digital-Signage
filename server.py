#!/usr/bin/env python3
"""
Local dev server with a CORS proxy endpoint.
Replaces: python3 -m http.server 8000
Run with: python3 server.py

GET /proxy?url=<encoded-url>  — fetches the URL server-side, returns with CORS headers
Everything else               — served as static files from the current directory
"""
import urllib.request
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler

TIMEOUT = 10
PORT = 8000


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/proxy":
            self._handle_proxy(parsed)
        else:
            super().do_GET()

    def _handle_proxy(self, parsed):
        params = urllib.parse.parse_qs(parsed.query)
        url = params.get("url", [None])[0]
        if not url:
            self.send_error(400, "Missing url parameter")
            return
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "Mozilla/5.0 (compatible; SignageProxy/1.0)"},
            )
            with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
                data = resp.read()
                content_type = resp.headers.get("Content-Type", "text/xml; charset=utf-8")
            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        except Exception as exc:
            self.send_error(502, str(exc))

    def log_message(self, fmt, *args):
        # Only log proxy requests, suppress static file noise
        if "/proxy" in (args[0] if args else ""):
            super().log_message(fmt, *args)


if __name__ == "__main__":
    server = HTTPServer(("", PORT), Handler)
    print(f"Serving on http://127.0.0.1:{PORT}/")
    print("CTRL+C to stop")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
