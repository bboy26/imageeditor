const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const upload = document.getElementById("upload");
const rotateButton = document.getElementById("rotate");
const resizeButton = document.getElementById("resize");
const grayscaleButton = document.getElementById("grayscale");
const sepiaButton = document.getElementById("sepia");
const blurButton = document.getElementById("blur");
const brightnessButton = document.getElementById("brightness");
const contrastButton = document.getElementById("contrast");
const clearFiltersButton = document.getElementById("clearFilters");
const cropButton = document.getElementById("crop");
const clearButton = document.getElementById("clear");
const progressBar = document.getElementById("filter-progress");
const downloadButton = document.getElementById("download");

let img = new Image();  // Store the uploaded image
let imgWidth = 600, imgHeight = 400;  // Default size for the image
let cropping = false;
let startX, startY, endX, endY;
let currentFilter = '';

// Upload Image
upload.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      img.onload = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// Rotate Image
let rotation = 0;
rotateButton.addEventListener("click", () => {
  rotation += 90;
  if (rotation >= 360) rotation = 0;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(img, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
  ctx.restore();
});

// Resize Image
resizeButton.addEventListener("click", () => {
  const width = prompt("Enter new width", imgWidth);
  const height = prompt("Enter new height", imgHeight);
  if (width && height) {
    imgWidth = parseInt(width);
    imgHeight = parseInt(height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
  }
});

// Apply Filter Function
function applyFilter() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
  let filterValue = progressBar.value;

  switch (currentFilter) {
    case 'grayscale':
      ctx.filter = `grayscale(${filterValue}%)`;
      break;
    case 'sepia':
      ctx.filter = `sepia(${filterValue}%)`;
      break;
    case 'blur':
      ctx.filter = `blur(${filterValue}px)`;
      break;
    case 'brightness':
      ctx.filter = `brightness(${filterValue}%)`;
      break;
    case 'contrast':
      ctx.filter = `contrast(${filterValue}%)`;
      break;
    default:
      ctx.filter = 'none';
  }

  ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
  ctx.filter = 'none';  // Reset filter
}

// Filter Buttons
grayscaleButton.addEventListener("click", () => {
  currentFilter = 'grayscale';
  applyFilter();
});

sepiaButton.addEventListener("click", () => {
  currentFilter = 'sepia';
  applyFilter();
});

blurButton.addEventListener("click", () => {
  currentFilter = 'blur';
  applyFilter();
});

brightnessButton.addEventListener("click", () => {
  currentFilter = 'brightness';
  applyFilter();
});

contrastButton.addEventListener("click", () => {
  currentFilter = 'contrast';
  applyFilter();
});

// Update filter live when progress bar changes
progressBar.addEventListener("input", applyFilter);

// Clear All Filters
clearFiltersButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
  progressBar.value = 0;
  currentFilter = ''; // Reset the filter
});

// Crop Image
cropButton.addEventListener("click", () => {
  cropping = !cropping;
  if (cropping) {
    cropButton.textContent = "Finish Crop";
    canvas.addEventListener("mousedown", startCrop);
    canvas.addEventListener("mousemove", updateCrop);
    canvas.addEventListener("mouseup", finishCrop);
  } else {
    cropButton.textContent = "Crop";
    canvas.removeEventListener("mousedown", startCrop);
    canvas.removeEventListener("mousemove", updateCrop);
    canvas.removeEventListener("mouseup", finishCrop);
  }
});

// Drawing crop area
function startCrop(e) {
  const rect = canvas.getBoundingClientRect();
  startX = e.clientX - rect.left;
  startY = e.clientY - rect.top;
}

function updateCrop(e) {
  if (cropping) {
    const rect = canvas.getBoundingClientRect();
    endX = e.clientX - rect.left;
    endY = e.clientY - rect.top;
    drawCropRectangle();
  }
}

function finishCrop() {
  cropping = false;
  const cropWidth = Math.abs(endX - startX);
  const cropHeight = Math.abs(endY - startY);
  const cropX = Math.min(startX, endX);
  const cropY = Math.min(startY, endY);
  const croppedImage = ctx.getImageData(cropX, cropY, cropWidth, cropHeight);
  canvas.width = cropWidth;
  canvas.height = cropHeight;
  ctx.putImageData(croppedImage, 0, 0);
  cropButton.textContent = "Crop";
}

function drawCropRectangle() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
  const width = endX - startX;
  const height = endY - startY;
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  ctx.strokeRect(startX, startY, width, height);
}

// Clear Canvas
clearButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Download Image
downloadButton.addEventListener("click", () => {
  const dataURL = canvas.toDataURL("image/png");  // You can switch to "image/jpeg" for JPG
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = "edited_image.png";  // Change the filename as necessary
  link.click();
});
