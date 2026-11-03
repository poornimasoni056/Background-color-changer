const palette = [
  { hex: "#34443A", name: "Forest" }, { hex: "#563B35", name: "Cocoa" },
  { hex: "#44384F", name: "Plum" }, { hex: "#554A2D", name: "Olive" },
  { hex: "#30464D", name: "Ocean" }, { hex: "#57383B", name: "Rosewood" },
  { hex: "#41452F", name: "Moss" }, { hex: "#59452C", name: "Amber" },
  { hex: "#34394F", name: "Midnight" }, { hex: "#30463D", name: "Pine" },
  { hex: "#514238", name: "Walnut" }, { hex: "#41413C", name: "Slate" },
];

const canvas = document.querySelector("#canvas");
const swatches = document.querySelector("#swatches");
const colorPicker = document.querySelector("#colorPicker");
const hexValue = document.querySelector("#hexValue");
const selectedDot = document.querySelector("#selectedDot");
const canvasIndex = document.querySelector(".canvas-index");
const toast = document.querySelector("#toast");
let activeColor = palette[0].hex;
let toastTimer;

function readableText(hex) {
  const rgb = hex.match(/[a-f\d]{2}/gi).map((part) => parseInt(part, 16) / 255);
  const luminance = rgb.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return luminance[0] * 0.2126 + luminance[1] * 0.7152 + luminance[2] * 0.0722 > 0.52 ? "#35382f" : "#fffaf2";
}

function paint(hex, source = "palette") {
  activeColor = hex.toUpperCase();
  document.documentElement.style.setProperty("--page-color", activeColor);
  canvas.style.setProperty("--canvas-color", activeColor);
  canvas.style.color = readableText(activeColor);
  hexValue.textContent = activeColor;
  selectedDot.style.background = activeColor;
  colorPicker.value = activeColor;
  canvasIndex.innerHTML = `${String(palette.findIndex((item) => item.hex === activeColor) + 1 || 1).padStart(2, "0")} <i>/</i> 12`;
  document.querySelectorAll(".swatch").forEach((button) => {
    const selected = button.dataset.color === activeColor;
    button.setAttribute("aria-pressed", String(selected));
    button.style.setProperty("--check-color", readableText(button.dataset.color));
  });
  if (source === "custom") document.querySelectorAll(".swatch").forEach((button) => button.setAttribute("aria-pressed", "false"));
}

palette.forEach(({ hex, name }) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "swatch";
  button.style.backgroundColor = hex;
  button.dataset.color = hex;
  button.setAttribute("aria-label", `${name}, ${hex}`);
  button.setAttribute("aria-pressed", String(hex === activeColor));
  button.addEventListener("click", () => paint(hex));
  swatches.append(button);
});

function surprise() {
  const options = palette.filter((item) => item.hex !== activeColor);
  paint(options[Math.floor(Math.random() * options.length)].hex);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1900);
}

colorPicker.value = activeColor;
colorPicker.addEventListener("input", (event) => paint(event.target.value, "custom"));
document.querySelector("#randomButton").addEventListener("click", surprise);
document.addEventListener("keydown", (event) => {
  if (event.code === "Space" && !["INPUT", "BUTTON"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    surprise();
  }
});
document.querySelector("#copyButton").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(`background-color: ${activeColor};`);
    showToast(`CSS copied — ${activeColor}`);
  } catch {
    showToast(`Your colour: ${activeColor}`);
  }
});

// Apply the default shade on load so the page and preview start in sync.
paint(activeColor);
