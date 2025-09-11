#!/usr/bin/env python3
"""
Simple HTTP server for serving the unified Figma Make Competition portfolio.
This serves all apps from a single entry point with proper CORS headers.
"""

import http.server
import socketserver
import webbrowser
import os
from pathlib import Path

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

def serve_portfolio(port=8000, open_browser=True):
    """Serve the portfolio on the specified port"""
    # Change to the project directory
    os.chdir(Path(__file__).parent)
    
    with socketserver.TCPServer(("", port), CORSHTTPRequestHandler) as httpd:
        print(f"🚀 Serving Figma Make Competition Portfolio")
        print(f"📍 URL: http://localhost:{port}")
        print(f"📁 Directory: {os.getcwd()}")
        print(f"⏹️  Press Ctrl+C to stop the server")
        
        if open_browser:
            webbrowser.open(f'http://localhost:{port}')
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print(f"\n✅ Server stopped")

if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    serve_portfolio(port)
