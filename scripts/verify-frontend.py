from playwright.sync_api import sync_playwright, expect
import time

def verify_frontend():
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        print("Navigating to home page...")
        page.goto("http://localhost:3000")

        # Wait for page to load (network idle might be too strict if polling, but load is good)
        page.wait_for_load_state("networkidle")

        # 1. Desktop: Initial Locked State
        print("Verifying Locked State (Desktop)...")
        expect(page.get_by_text("X402 Creator Platform")).to_be_visible()
        expect(page.get_by_text("The Future of Cross-Chain Payments")).not_to_be_visible()
        # Actually, in the component, the CHILDREN are not rendered if locked.
        # But wait, looking at ContentPaywall.tsx:
        # if (isUnlocked) { return children }
        # else { return Locked State Rendering (which has overlay) }
        # So the "The Future of Cross-Chain Payments" text (which is in children) should NOT be in the DOM at all.

        # Verify Paywall Overlays exist
        buy_buttons = page.get_by_role("button", name="Buy for")
        expect(buy_buttons).to_have_count(2)

        page.screenshot(path="/home/jules/verification/1_desktop_locked.png")
        print("Screenshot 1 taken.")

        # 2. Unlock Flow (Simulated)
        # Since we mocked the wallet connection requirement in the component?
        # No, ContentPaywall checks `isEvmConnected` or `solPublicKey`.
        # Without connecting a wallet, clicking "Buy" should alert.
        # Playwright handle alert:
        page.on("dialog", lambda dialog: dialog.accept())

        # Try clicking Buy without wallet
        buy_buttons.first.click()
        # Verify alert happened (we can't easily screenshot alert, but script continues)

        # To test UNLOCK, we need to mock the wallet connection state or bypass the check.
        # Since RainbowKit/SolanaAdapter state is hard to mock via pure Playwright interaction without extension,
        # We might need to rely on the Locked state visual for now, unless we can inject a mock wallet.

        # However, for the purpose of THIS verification task (Visual Verification),
        # seeing the "Locked" state with correct styling is the primary goal requested.
        # "Verify the blur intensity... Verify Video/Audio placeholder".

        # Let's inspect the DOM for the Article placeholder.
        # In ContentPaywall.tsx:
        # {contentType === "article" && ... "Exclusive Analysis" ... "backdrop-blur-[2px]"}
        expect(page.get_by_text("Exclusive Analysis")).to_be_visible()

        # 3. Mobile View
        print("Verifying Mobile View...")
        mobile_context = browser.new_context(viewport={'width': 390, 'height': 844}) # iPhone 12
        mobile_page = mobile_context.new_page()
        mobile_page.goto("http://localhost:3000")
        mobile_page.wait_for_load_state("networkidle")

        mobile_page.screenshot(path="/home/jules/verification/2_mobile_locked.png")
        print("Screenshot 2 taken.")

        browser.close()

if __name__ == "__main__":
    verify_frontend()
