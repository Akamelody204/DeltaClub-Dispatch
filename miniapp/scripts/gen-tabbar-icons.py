"""Generate minimal 81x81 PNGs for WeChat tabBar (gray + blue accent)."""
import struct
import zlib
import os

ROOT = os.path.join(os.path.dirname(__file__), "..", "src", "static", "tabbar")


def chunk(tag: bytes, data: bytes) -> bytes:
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)


def png_rgba(w: int, h: int, r: int, g: int, b: int) -> bytes:
    ihdr = struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)
    row = bytes([0]) + bytes([r, g, b, 255] * w)
    raw = row * h
    comp = zlib.compress(raw, 9)
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", comp) + chunk(b"IEND", b"")


def main() -> None:
    os.makedirs(ROOT, exist_ok=True)
    gray = png_rgba(81, 81, 0x88, 0x88, 0x88)
    blue = png_rgba(81, 81, 0x07, 0x6B, 0xFF)
    pairs = [
        ("home", gray, blue),
        ("order", gray, blue),
        ("orders", gray, blue),
        ("mine", gray, blue),
    ]
    for base, normal, active in pairs:
        open(os.path.join(ROOT, f"{base}.png"), "wb").write(normal)
        open(os.path.join(ROOT, f"{base}-active.png"), "wb").write(active)
    print("written:", ROOT)


if __name__ == "__main__":
    main()
