// *** variables *** //

// --- selectors from a color div --- //
const colorBlocks = [...document.querySelectorAll(".color")];
const colorNames = [...document.querySelectorAll(".color-name")];
const adjustBtns = [...document.querySelectorAll(".adjust-btn")];
const lockBtns = [...document.querySelectorAll(".lock-btn")];
const colorSettingsContainers = [
  ...document.querySelectorAll(".color-settings"),
];
const rangeInput = [...document.querySelectorAll('input[type="range"]')];
const hueSettings = [...document.querySelectorAll(".hue-block")];
const brightSettings = [...document.querySelectorAll(".bright-block")];
const saturSettings = [...document.querySelectorAll(".satur-block")];
let initialColors = [];
let palettes = [];

// --- selectors from the control panel --- //

const libraryBtn = document.querySelector(".library-btn");
const generateBtn = document.querySelector(".generate-btn");
const saveBtn = document.querySelector(".save-btn");

// --- popup selectors --- //

const copyPopup = document.querySelector(".copy-popup");
const savePopup = document.querySelector(".save-popup");
const libraryPopup = document.querySelector(".library-popup");
const paletteContainer = document.querySelector(".palette");

// *** events *** //

window.addEventListener("DOMContentLoaded", () => {
  generateColors();
  getFromLocal();
});

// generate colors //

generateBtn.addEventListener("click", () => {
  initialColors.length = 0;
  generateColors();
});

// color settings //
adjustBtns.forEach((btn) => {
  btn.addEventListener("click", (event) => {
    let target = adjustBtns.indexOf(event.target);
    colorSettingsContainers[target].classList.toggle("active");
    colorSettingsContainers[target].children[0].addEventListener(
      "click",
      () => {
        colorSettingsContainers[target].classList.remove("active");
      }
    );
  });
});

// lock color //
lockBtns.forEach((btn) => {
  btn.addEventListener("click", (event) => {
    lockColor(event);
  });
});

// control div colors with HSL settings //
rangeInput.forEach((input) => {
  input.addEventListener("input", controlHSL);
  input.addEventListener("change", (event) => {
    let targetColor = chroma(
      event.target.parentElement.parentElement.parentElement.style
        .backgroundColor
    ).hex();
    let targetText =
      event.target.parentElement.parentElement.parentElement.children[0];
    let targetAdjustBtn =
      event.target.parentElement.parentElement.parentElement.children[1]
        .children[0].children[0];
    let targetLockBtn =
      event.target.parentElement.parentElement.parentElement.children[1]
        .children[1].children[0];

    checkLuminance(targetColor, targetText);
    checkLuminance(targetColor, targetAdjustBtn);
    checkLuminance(targetColor, targetLockBtn);
  });
});

// copy to clipboard pop-up //

colorNames.forEach((name) => {
  name.addEventListener("click", (event) => {
    let targetHex = event.target.textContent;
    let fakeElement = document.createElement("textarea");
    let parentBox = colorBlocks[colorNames.indexOf(event.target)];
    fakeElement.textContent = targetHex;
    parentBox.appendChild(fakeElement);
    fakeElement.select();
    document.execCommand("copy");
    parentBox.removeChild(fakeElement);
    copyPopup.classList.add("active");
    copyPopup.querySelector(".popup-box").classList.add("active");
    setTimeout(() => {
      copyPopup.classList.remove("active");
      copyPopup.querySelector(".popup-box").classList.remove("active");
    }, 700);
  });
});

// update div names (hex)

colorBlocks.forEach((div) => {
  div.addEventListener("change", (e) => {
    changeHexText(e);
  });
});

// save a palette to the library

saveBtn.addEventListener("click", () => {
  savePopup.classList.add("active");
  savePopup.children[0].classList.add("active");
  savePopup.querySelector(".close-btn").addEventListener("click", () => {
    savePopup.classList.remove("active");
    savePopup.children[0].classList.remove("active");
  });
});

savePopup.querySelector(".save-btn").addEventListener("click", () => {
  let saveInput = savePopup.querySelector("input");
  if (saveInput.value === "") {
    return;
  }
  savePopup.classList.remove("active");
  savePopup.children[0].classList.remove("active");
  addPalette(saveInput.value);
  saveInput.value = "";
});

// library popup

libraryBtn.addEventListener("click", () => {
  libraryPopup.classList.add("active");
  libraryPopup.children[0].classList.add("active");
});

libraryPopup.querySelector(".close-btn").addEventListener("click", () => {
  libraryPopup.classList.remove("active");
  libraryPopup.children[0].classList.remove("active");
});

// *** functions *** //

// get random color (hex)

function randomHex() {
  let randomHex = chroma.random().hex();
  return randomHex;
}

// generate random colors (hex)

function generateColors() {
  colorBlocks.forEach((block) => {
    let colorName = block.children[0];
    // let colorIndex = colorBlocks.indexOf(block);
    let color = randomHex();
    let adjustBtn = block.children[1].children[0];
    let lockBtn = block.children[1].children[1];
    if (block.classList.contains("locked")) {
      initialColors.push(colorName.textContent);
      return;
    } else {
      initialColors.push(color);
    }
    colorName.textContent = color;
    block.style.backgroundColor = color;
    checkLuminance(color, colorName);
    checkLuminance(color, adjustBtn.children[0]);
    checkLuminance(color, lockBtn.children[0]);

    let hue = block.children[2].children[1].children[1];
    let bright = block.children[2].children[2].children[1];
    let satur = block.children[2].children[3].children[1];
    customizeColorSettings(color, hue, bright, satur);
  });
  setHSLValues();
}

// check text and icons brightness

function checkLuminance(color, content) {
  let luminance = chroma(color).luminance().toFixed(1);
  if (luminance > 0.5) {
    content.style.color = "black";
  } else {
    content.style.color = "white";
  }
}

// lock color on lock-btn click

function lockColor(event) {
  let target = event.target.children[0];
  let targetDiv = event.target.parentElement.parentElement;
  targetDiv.classList.toggle("locked");
  if (target.classList.contains("fa-unlock")) {
    target.classList.remove("fa-unlock");
    target.classList.add("fa-lock");
  } else {
    target.classList.remove("fa-lock");
    target.classList.add("fa-unlock");
  }
}

// add color values to color settings

function customizeColorSettings(color, hue, bright, satur) {
  // hue //
  hue.style.backgroundImage = `linear-gradient(to right, orange, yellow, green, blue, violet, red)`;

  // brightness //
  let middleBright = chroma(color).set("hsl.l", 0.5);
  let brightScale = chroma.scale(["black", middleBright, "white"]);
  bright.style.backgroundImage = `linear-gradient(to right, ${brightScale(
    0
  )}, ${brightScale(0.5)}, ${brightScale(1)})`;

  // saturation //
  let minSatur = chroma(color).set("hsl.s", 1);
  let maxSatur = chroma(color).set("hsl.s", 0);
  satur.style.backgroundImage = `linear-gradient(to right, ${maxSatur}, ${color}, ${minSatur})`;
}

// control color values (settings)

function controlHSL(event) {
  let targetColor =
    initialColors[
      colorBlocks.indexOf(
        event.target.parentElement.parentElement.parentElement
      )
    ];
  let targetDiv = event.target.parentElement.parentElement.parentElement;
  let currentSettings = event.target.parentElement.parentElement.querySelectorAll(
    'input[type="range"]'
  );
  let hue = currentSettings[0];
  let bright = currentSettings[1];
  let satur = currentSettings[2];
  let newColor = chroma(targetColor)
    .set("hsl.h", hue.value)
    .set("hsl.l", bright.value)
    .set("hsl.s", satur.value)
    .hex();
  targetDiv.style.backgroundColor = newColor;

  customizeColorSettings(newColor, hue, bright, satur);
}

// set color (settings) values when updating (generating) colors

function setHSLValues() {
  colorSettingsContainers.forEach((container) => {
    let currentColor =
      initialColors[colorSettingsContainers.indexOf(container)];
    let currentSettings = container.querySelectorAll('input[type="range"]');
    let hue = currentSettings[0];
    let bright = currentSettings[1];
    let satur = currentSettings[2];
    hue.value = chroma(currentColor).get("hsl.h").toFixed();
    bright.value = chroma(currentColor).get("hsl.l").toFixed(2);
    satur.value = chroma(currentColor).get("hsl.s").toFixed(2);
  });
}

// update color names when changing color settings

function changeHexText(event) {
  let targetDiv = event.target.parentElement.parentElement.parentElement;
  let targetHex =
    event.target.parentElement.parentElement.parentElement.children[0];
  targetHex.innerText = chroma(targetDiv.style.backgroundColor).hex();
}

// add palette in save popup

function addPalette(name) {
  let paletteObj;
  let colors = [];
  colorBlocks.forEach((div) => {
    colors.push(div.children[0].textContent);
  });
  paletteObj = { name, colors: [...colors] };
  palettes.push(paletteObj);
  addToLocal();
  addToLibrary();
}

function addToLibrary() {
  let paletteIndex = paletteContainer.children.length;
  let colorsArr = palettes[paletteIndex].colors;
  // --- create elements
  let savedPalette = document.createElement("div");
  savedPalette.classList.add("saved-palette");
  let paletteName = document.createElement("h3");
  paletteName.classList.add("palette-name");
  paletteName.textContent = palettes[paletteIndex].name;
  let colors = document.createElement("div");
  colors.classList.add("colors");
  let buttonsContainer = document.createElement("div");
  buttonsContainer.classList.add("buttons");
  let btnChoose = document.createElement("button");
  let btnRemove = document.createElement("button");
  btnChoose.classList.add("icon");
  btnRemove.classList.add("icon");
  let btnChooseIcon = document.createElement("img");
  let btnRemoveIcon = document.createElement("img");
  btnChooseIcon.classList.add("icon-img");
  btnRemoveIcon.classList.add("icon-img");

  // --- append elements
  paletteContainer.appendChild(savedPalette);
  savedPalette.appendChild(paletteName);
  savedPalette.appendChild(colors);
  colorsArr.forEach((color) => {
    let colorDiv = document.createElement("div");
    colorDiv.style.backgroundColor = color;
    colors.appendChild(colorDiv);
  });
  savedPalette.appendChild(buttonsContainer);
  buttonsContainer.appendChild(btnChoose);
  btnChoose.appendChild(btnChooseIcon);
  btnChooseIcon.src = "./icons/choose.svg";
  buttonsContainer.appendChild(btnRemove);
  btnRemove.appendChild(btnRemoveIcon);
  btnRemoveIcon.src = "./icons/remove.svg";

  // --- remove and select a palette
  btnChoose.addEventListener("click", selectPalette);
  btnRemove.addEventListener("click", removePalette);
}

function removePalette(event) {
  let localPalettes = [];
  let targetPalette = event.target.parentElement.parentElement;
  let paletteArr = [...paletteContainer.children];
  let targetIndex = paletteArr.indexOf(targetPalette);
  targetPalette.classList.add("hide");
  setTimeout(() => {
    paletteContainer.removeChild(targetPalette);
  }, 300);
  palettes.splice(targetIndex, 1);
  localPalettes = [...JSON.parse(localStorage.getItem("palettes"))];
  localPalettes = palettes;
  localStorage.setItem("palettes", JSON.stringify(localPalettes));
}

function selectPalette(event) {
  let targetPalette = event.target.parentElement.parentElement;
  let paletteArr = [...paletteContainer.children];
  let targetIndex = paletteArr.indexOf(targetPalette);
  colorBlocks.forEach((div, index) => {
    div.style.backgroundColor = palettes[targetIndex].colors[index];
    div.children[0].textContent = palettes[targetIndex].colors[index];
    let color = palettes[targetIndex].colors[index];
    let text = div.children[0];
    let settingsIcon = div.children[1].children[0].children[0];
    let lockIcon = div.children[1].children[1].children[0];
    checkLuminance(color, text);
    checkLuminance(color, settingsIcon);
    checkLuminance(color, lockIcon);
  });
}

// localStorage functions

function addToLocal() {
  let localPalettes = [];
  if (localStorage.getItem("palettes")) {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
    localPalettes = [...palettes];
    localStorage.setItem("palettes", JSON.stringify(localPalettes));
  } else {
    localPalettes = [...palettes];
    localStorage.setItem("palettes", JSON.stringify(localPalettes));
  }
}

function getFromLocal() {
  let localPalettes = [];
  if (localStorage.getItem("palettes")) {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
    palettes = [...localPalettes];
    for (i = 0; i < palettes.length; i++) {
      addToLibrary();
    }
  }
}
