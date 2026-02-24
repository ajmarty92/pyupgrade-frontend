import threading
import http.server
import socketserver
import time
from playwright.sync_api import sync_playwright, expect

# --- Server Setup ---
PORT = 8000
DIRECTORY = "."

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

def run_server():
    with ReusableTCPServer(("", PORT), Handler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()

def test_repo_selection_view():
    # Start server in background
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    time.sleep(2) # Wait for server to start

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Helper to setup mocks
        def setup_mocks(repos_body="[]", repos_delay=0):
            # Mock /api/me to return logged in
            page.route("**/api/me", lambda route: route.fulfill(status=200, body='{"email": "test@example.com"}', headers={'Content-Type': 'application/json'}))

            # Mock /api/repositories with optional delay
            def handle_repos(route):
                if repos_delay > 0:
                    time.sleep(repos_delay)
                route.fulfill(status=200, body=repos_body, headers={'Content-Type': 'application/json'})

            page.route("**/api/repositories", handle_repos)

        print("--- Testing Loading State ---")
        setup_mocks(repos_delay=3) # 3 seconds delay
        page.goto(f"http://localhost:{PORT}/app.html")
        expect(page.get_by_text("Fetching...")).to_be_visible()
        print("✅ Loading state verified")

        print("--- Testing Empty State ---")
        setup_mocks(repos_body="[]", repos_delay=0)
        page.reload()
        expect(page.get_by_text("No Python Repos Found")).to_be_visible()
        page.screenshot(path="tests/repo_empty.png")
        print("✅ Empty state verified")

        print("--- Testing Populated State ---")
        repos_data = """
        [
            {
                "id": 1,
                "full_name": "test/repo1",
                "name": "repo1",
                "private": false,
                "description": "Test Repo 1",
                "owner": {"login": "test"}
            },
            {
                "id": 2,
                "full_name": "test/repo2",
                "name": "repo2",
                "private": true,
                "description": "Test Repo 2",
                "owner": {"login": "test"}
            }
        ]
        """
        setup_mocks(repos_body=repos_data, repos_delay=0)
        page.reload()

        # Verify headers
        expect(page.get_by_text("Select Repo")).to_be_visible()

        # Verify repo items
        expect(page.get_by_text("test / repo1")).to_be_visible()
        expect(page.get_by_text("Test Repo 1")).to_be_visible()

        expect(page.get_by_text("test / repo2")).to_be_visible()
        expect(page.get_by_text("Test Repo 2")).to_be_visible()

        # Verify default selection (first one)
        # We check if the radio button for the first one is checked
        # The radio button inputs have name="repo-selection"
        radios = page.locator("input[name='repo-selection']")
        expect(radios.first).to_be_checked()

        # Select second repo
        # Click on the container or the radio
        page.get_by_text("test / repo2").click()
        expect(radios.nth(1)).to_be_checked()

        # Verify Scan button is enabled
        scan_btn = page.get_by_role("button", name="Scan Repo")
        expect(scan_btn).to_be_enabled()

        page.screenshot(path="tests/repo_populated.png")
        print("✅ Populated state verified")

        browser.close()

if __name__ == "__main__":
    test_repo_selection_view()
