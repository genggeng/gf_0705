const colorNames = [
  { name: "Ink Forest", hex: "#17211d" },
  { name: "Studio Green", hex: "#0c8f63" },
  { name: "Signal Blue", hex: "#4267d6" },
  { name: "Warm Amber", hex: "#f2b84b" },
  { name: "Soft Rose", hex: "#d85f72" },
  { name: "Canvas White", hex: "#fbfdfb" }
];

const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 675">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop stop-color="#0c8f63"/>
      <stop offset=".45" stop-color="#4267d6"/>
      <stop offset="1" stop-color="#f2b84b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="675" fill="#fbfdfb"/>
  <circle cx="240" cy="230" r="170" fill="#0c8f63"/>
  <rect x="410" y="130" width="310" height="270" rx="38" fill="url(#g)"/>
  <path d="M140 520 C280 390 470 590 760 430 L760 675 L140 675 Z" fill="#17211d"/>
  <circle cx="690" cy="160" r="70" fill="#d85f72"/>
</svg>`;

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
}

function nearestColorName(hex) {
  const rgb = hexToRgb(hex);
  let best = colorNames[0];
  let bestDistance = Infinity;
  for (const item of colorNames) {
    const candidate = hexToRgb(item.hex);
    const distance = Math.hypot(rgb.r - candidate.r, rgb.g - candidate.g, rgb.b - candidate.b);
    if (distance < bestDistance) {
      best = item;
      bestDistance = distance;
    }
  }
  return best.name;
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setColor(hex) {
  const rgb = hexToRgb(hex);
  const colorBox = document.getElementById("selectedColor");
  if (colorBox) colorBox.style.background = hex;
  setText("hexValue", hex);
  setText("rgbValue", `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
  setText("hslValue", rgbToHsl(rgb.r, rgb.g, rgb.b));
  setText("colorName", nearestColorName(hex));
  setText("aiMood", moodForColor(rgb));
  setText("cssVars", `--brand: ${hex}; --brand-rgb: ${rgb.r} ${rgb.g} ${rgb.b};`);
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

function moodForColor({ r, g, b }) {
  if (g > r && g > b) return "Fresh, calm, organic. Good for wellness, SaaS, and editorial interfaces.";
  if (b > r && b > g) return "Focused, technical, trustworthy. Good for dashboards and product pages.";
  if (r > 190 && g > 120) return "Warm, expressive, social. Good for creator tools and launch pages.";
  if (r < 50 && g < 50 && b < 50) return "Premium, grounded, high contrast. Good for typography-led brands.";
  return "Balanced and flexible. Pair with one neutral and one accent for a complete palette.";
}

function buildPalette(hex) {
  const rgb = hexToRgb(hex);
  const mixes = [
    [rgb.r, rgb.g, rgb.b],
    [Math.round(rgb.r * 0.55), Math.round(rgb.g * 0.55), Math.round(rgb.b * 0.55)],
    [Math.min(255, Math.round(rgb.r * 1.22 + 28)), Math.min(255, Math.round(rgb.g * 1.18 + 20)), Math.min(255, Math.round(rgb.b * 1.12 + 14))],
    [242, 184, 75],
    [251, 253, 251]
  ];
  return mixes.map(([r, g, b]) => rgbToHex(r, g, b));
}

function renderPalette(colors) {
  const palette = document.getElementById("palette");
  if (!palette) return;
  palette.innerHTML = "";
  colors.forEach((hex) => {
    const button = document.createElement("button");
    button.className = "swatch";
    button.style.background = hex;
    button.title = hex;
    button.type = "button";
    button.addEventListener("click", () => {
      setColor(hex);
      renderPalette(buildPalette(hex));
    });
    palette.appendChild(button);
  });
}

function initTool() {
  const preview = document.getElementById("previewImage");
  const marker = document.getElementById("pickMarker");
  const upload = document.getElementById("imageUpload");
  const uploadMirror = document.getElementById("imageUploadMirror");
  const screenPick = document.getElementById("screenPick");
  const palette = document.getElementById("palette");
  const aiNotes = document.getElementById("aiNotes");
  if (!preview || !upload) return;

  preview.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sampleSvg)}`;
  setColor("#0C8F63");
  renderPalette(["#0C8F63", "#17211D", "#4267D6", "#F2B84B", "#FBFDFB"]);

  const loadFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      preview.src = reader.result;
      preview.onload = () => sampleImageColor(preview);
    };
    reader.readAsDataURL(file);
  };

  upload.addEventListener("change", () => loadFile(upload.files && upload.files[0]));
  if (uploadMirror) {
    uploadMirror.addEventListener("change", () => loadFile(uploadMirror.files && uploadMirror.files[0]));
  }

  if (screenPick) {
    screenPick.addEventListener("click", async () => {
      if (!window.EyeDropper) {
        screenPick.textContent = "Browser not supported";
        setTimeout(() => { screenPick.textContent = "Pick from screen"; }, 1400);
        return;
      }
      try {
        const result = await new EyeDropper().open();
        setColor(result.sRGBHex.toUpperCase());
        renderPalette(buildPalette(result.sRGBHex));
      } catch (error) {
        screenPick.textContent = "Pick from screen";
      }
    });
  }

  preview.addEventListener("click", (event) => {
    const rect = preview.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) return;
    if (marker) {
      marker.style.left = `${x * 100}%`;
      marker.style.top = `${y * 100}%`;
    }
    sampleImageColor(preview, x, y);
  });

  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const target = document.getElementById(button.dataset.copy);
      if (!target) return;
      await navigator.clipboard.writeText(target.textContent);
      button.textContent = "OK";
      setTimeout(() => { button.textContent = "Copy"; }, 900);
    });
  });

  document.querySelectorAll(".tool-tab[data-mode]").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tool-tab[data-mode]").forEach((item) => {
        item.classList.toggle("active", item === tab);
      });
      palette?.classList.remove("is-focused");
      aiNotes?.classList.remove("is-focused");

      const mode = tab.dataset.mode;
      if (mode === "image") {
        preview.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      }
      if (mode === "palette") {
        palette?.classList.add("is-focused");
        palette?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      }
      if (mode === "ai") {
        aiNotes?.classList.add("is-focused");
        aiNotes?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      }
    });
  });
}

function sampleImageColor(image, xRatio = 0.5, yRatio = 0.5) {
  const canvas = document.createElement("canvas");
  const width = image.naturalWidth || 900;
  const height = image.naturalHeight || 675;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, width, height);
  const x = Math.max(0, Math.min(width - 1, Math.round(width * xRatio)));
  const y = Math.max(0, Math.min(height - 1, Math.round(height * yRatio)));
  const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
  const hex = rgbToHex(r, g, b);
  setColor(hex);
  renderPalette(buildPalette(hex));
}

document.addEventListener("DOMContentLoaded", initTool);
