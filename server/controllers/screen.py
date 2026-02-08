"""Screen capture controller — captures the screen and returns JPEG bytes."""

import io
import base64

import pyautogui


class ScreenController:
    def capture(self, quality: int = 50, scale: float = 0.5, **_):
        """
        Capture the screen and return a base64-encoded JPEG string.
        - quality: JPEG quality (1-100). Lower = smaller payload.
        - scale:   Downscale factor (0.1-1.0). Lower = smaller payload.
        """
        screenshot = pyautogui.screenshot()

        # Downscale for faster transfer
        if scale < 1.0:
            new_w = max(1, int(screenshot.width * scale))
            new_h = max(1, int(screenshot.height * scale))
            screenshot = screenshot.resize((new_w, new_h))

        buf = io.BytesIO()
        screenshot.save(buf, format="JPEG", quality=quality, optimize=True)
        buf.seek(0)
        b64 = base64.b64encode(buf.getvalue()).decode("ascii")
        return {
            "image": b64,
            "width": screenshot.width,
            "height": screenshot.height,
        }
