class ImageResizer {
	constructor() {
		this.originalImage = null;
		this.canvas = null;
		this.ctx = null;
		this.currentSettings = {
			size: 'square',
			fit: 'fill',
			bgColor: '#000000',
			format: 'png'
		};
		
		this.sizeRatios = {
			square: { width: 1, height: 1 },
			portrait: { width: 3, height: 4 },
			landscape: { width: 4, height: 3 }
		};
		
		this.init();
	}
	
	init() {
		this.setupEventListeners();
		this.setupCanvas();
	}
	
	setupEventListeners() {
		// File input and drop zone
		const dropZone = document.getElementById('dropZone');
		const fileInput = document.getElementById('fileInput');
		
		dropZone.addEventListener('click', () => fileInput.click());
		dropZone.addEventListener('dragover', this.handleDragOver.bind(this));
		dropZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
		dropZone.addEventListener('drop', this.handleDrop.bind(this));
		fileInput.addEventListener('change', this.handleFileSelect.bind(this));
		
		// Control inputs
		document.querySelectorAll('input[name="size"]').forEach(radio => {
			radio.addEventListener('change', this.handleSizeChange.bind(this));
		});
		
		document.querySelectorAll('input[name="fit"]').forEach(radio => {
			radio.addEventListener('change', this.handleFitChange.bind(this));
		});
		
		document.getElementById('bgColor').addEventListener('change', this.handleBgColorChange.bind(this));
		document.getElementById('outputFormat').addEventListener('change', this.handleFormatChange.bind(this));
		
		// Save button
		document.getElementById('saveButton').addEventListener('click', this.saveImage.bind(this));
	}
	
	setupCanvas() {
		this.canvas = document.createElement('canvas');
		this.ctx = this.canvas.getContext('2d');
	}
	
	handleDragOver(e) {
		e.preventDefault();
		document.getElementById('dropZone').classList.add('drag-over');
	}
	
	handleDragLeave(e) {
		e.preventDefault();
		document.getElementById('dropZone').classList.remove('drag-over');
	}
	
	handleDrop(e) {
		e.preventDefault();
		document.getElementById('dropZone').classList.remove('drag-over');
		
		const files = e.dataTransfer.files;
		if (files.length > 0) {
			this.loadImage(files[0]);
		}
	}
	
	handleFileSelect(e) {
		if (e.target.files.length > 0) {
			this.loadImage(e.target.files[0]);
		}
	}
	
	handleSizeChange(e) {
		this.currentSettings.size = e.target.value;
		this.updatePreview();
	}
	
	handleFitChange(e) {
		this.currentSettings.fit = e.target.value;
		this.updatePreview();
	}
	
	handleBgColorChange(e) {
		this.currentSettings.bgColor = e.target.value;
		this.updatePreview();
	}
	
	handleFormatChange(e) {
		this.currentSettings.format = e.target.value;
	}
	
	loadImage(file) {
		if (!file.type.startsWith('image/')) {
			alert('Please select a valid image file.');
			return;
		}
		
		const reader = new FileReader();
		reader.onload = (e) => {
			const img = new Image();
			img.onload = () => {
				this.originalImage = img;
				this.showControls();
				this.updatePreview();
			};
			img.src = e.target.result;
		};
		reader.readAsDataURL(file);
	}
	
	showControls() {
		document.getElementById('controlsSection').style.display = 'block';
		document.getElementById('previewSection').style.display = 'block';
		document.getElementById('saveSection').style.display = 'block';
	}
	
	updatePreview() {
		if (!this.originalImage) return;
		
		const ratio = this.sizeRatios[this.currentSettings.size];
		const previewSize = 300; // Base size for preview
		
		let svgWidth, svgHeight;
		if (ratio.width >= ratio.height) {
			svgWidth = previewSize;
			svgHeight = (previewSize * ratio.height) / ratio.width;
		} else {
			svgHeight = previewSize;
			svgWidth = (previewSize * ratio.width) / ratio.height;
		}
		
		const svg = document.getElementById('previewSvg');
		const rect = document.getElementById('previewRect');
		const pattern = document.getElementById('imagePattern');
		const patternImage = document.getElementById('patternImage');
		
		// Set SVG dimensions
		svg.setAttribute('width', svgWidth);
		svg.setAttribute('height', svgHeight);
		svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
		
		// Configure pattern and image based on fit mode
		if (this.currentSettings.fit === 'fill') {
			// Fill mode: crop image to fill the entire area
			const imageAspect = this.originalImage.width / this.originalImage.height;
			const targetAspect = ratio.width / ratio.height;
			
			let patternWidth, patternHeight;
			if (imageAspect > targetAspect) {
				// Image is wider than target, fit by height
				patternHeight = svgHeight;
				patternWidth = (svgHeight * imageAspect);
			} else {
				// Image is taller than target, fit by width
				patternWidth = svgWidth;
				patternHeight = (svgWidth / imageAspect);
			}
			
			pattern.setAttribute('width', patternWidth);
			pattern.setAttribute('height', patternHeight);
			pattern.setAttribute('x', (svgWidth - patternWidth) / 2);
			pattern.setAttribute('y', (svgHeight - patternHeight) / 2);
			
			patternImage.setAttribute('width', patternWidth);
			patternImage.setAttribute('height', patternHeight);
			patternImage.setAttribute('preserveAspectRatio', 'xMidYMid slice');
			
			rect.setAttribute('fill', 'url(#imagePattern)');
		} else {
			// Fit mode: show entire image with background
			const imageAspect = this.originalImage.width / this.originalImage.height;
			const targetAspect = ratio.width / ratio.height;
			
			let imageWidth, imageHeight;
			if (imageAspect > targetAspect) {
				// Image is wider, fit by width
				imageWidth = svgWidth;
				imageHeight = svgWidth / imageAspect;
			} else {
				// Image is taller, fit by height
				imageHeight = svgHeight;
				imageWidth = svgHeight * imageAspect;
			}
			
			const x = (svgWidth - imageWidth) / 2;
			const y = (svgHeight - imageHeight) / 2;
			
			pattern.setAttribute('width', svgWidth);
			pattern.setAttribute('height', svgHeight);
			pattern.setAttribute('x', 0);
			pattern.setAttribute('y', 0);
			
			// Clear any existing pattern content and rebuild
			while (pattern.firstChild) {
				pattern.removeChild(pattern.firstChild);
			}
			
			// Add background rect
			const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
			bgRect.setAttribute('width', svgWidth);
			bgRect.setAttribute('height', svgHeight);
			bgRect.setAttribute('fill', this.currentSettings.bgColor);
			pattern.appendChild(bgRect);
			
			// Add image
			const imageElement = document.createElementNS('http://www.w3.org/2000/svg', 'image');
			imageElement.setAttribute('x', x);
			imageElement.setAttribute('y', y);
			imageElement.setAttribute('width', imageWidth);
			imageElement.setAttribute('height', imageHeight);
			imageElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
			imageElement.setAttributeNS('http://www.w3.org/1999/xlink', 'href', this.originalImage.src);
			pattern.appendChild(imageElement);
			
			rect.setAttribute('fill', 'url(#imagePattern)');
		}
		
		// Set the image source for fill mode
		if (this.currentSettings.fit === 'fill') {
			patternImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', this.originalImage.src);
		}
		
		// Update dimensions info
		const targetWidth = 800; // Standard output size
		const targetHeight = Math.round((targetWidth * ratio.height) / ratio.width);
		
		document.getElementById('dimensionsInfo').textContent = 
			`Output dimensions: ${targetWidth} × ${targetHeight} pixels (${this.currentSettings.size} ${ratio.width}:${ratio.height})`;
	}
	
	saveImage() {
		if (!this.originalImage) return;
		
		const ratio = this.sizeRatios[this.currentSettings.size];
		const outputWidth = 800; // You can make this configurable
		const outputHeight = Math.round((outputWidth * ratio.height) / ratio.width);
		
		// Set canvas dimensions
		this.canvas.width = outputWidth;
		this.canvas.height = outputHeight;
		
		// Clear canvas
		this.ctx.clearRect(0, 0, outputWidth, outputHeight);
		
		if (this.currentSettings.fit === 'fill') {
			// Fill mode: crop and fill entire canvas
			this.drawFillMode(outputWidth, outputHeight);
		} else {
			// Fit mode: show entire image with background
			this.drawFitMode(outputWidth, outputHeight);
		}
		
		// Convert to desired format and download
		const quality = this.currentSettings.format === 'jpeg' ? 0.9 : undefined;
		const mimeType = `image/${this.currentSettings.format}`;
		
		this.canvas.toBlob((blob) => {
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `resized-image-${this.currentSettings.size}.${this.currentSettings.format}`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		}, mimeType, quality);
	}
	
	drawFillMode(canvasWidth, canvasHeight) {
		const imageAspect = this.originalImage.width / this.originalImage.height;
		const canvasAspect = canvasWidth / canvasHeight;
		
		let sourceX = 0, sourceY = 0, sourceWidth = this.originalImage.width, sourceHeight = this.originalImage.height;
		
		if (imageAspect > canvasAspect) {
			// Image is wider than canvas, crop horizontally
			sourceWidth = this.originalImage.height * canvasAspect;
			sourceX = (this.originalImage.width - sourceWidth) / 2;
		} else {
			// Image is taller than canvas, crop vertically
			sourceHeight = this.originalImage.width / canvasAspect;
			sourceY = (this.originalImage.height - sourceHeight) / 2;
		}
		
		this.ctx.drawImage(
			this.originalImage,
			sourceX, sourceY, sourceWidth, sourceHeight,
			0, 0, canvasWidth, canvasHeight
		);
	}
	
	drawFitMode(canvasWidth, canvasHeight) {
		// Fill background
		this.ctx.fillStyle = this.currentSettings.bgColor;
		this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
		
		// Calculate image dimensions to fit within canvas
		const imageAspect = this.originalImage.width / this.originalImage.height;
		const canvasAspect = canvasWidth / canvasHeight;
		
		let drawWidth, drawHeight, drawX, drawY;
		
		if (imageAspect > canvasAspect) {
			// Image is wider, fit by width
			drawWidth = canvasWidth;
			drawHeight = canvasWidth / imageAspect;
			drawX = 0;
			drawY = (canvasHeight - drawHeight) / 2;
		} else {
			// Image is taller, fit by height
			drawHeight = canvasHeight;
			drawWidth = canvasHeight * imageAspect;
			drawY = 0;
			drawX = (canvasWidth - drawWidth) / 2;
		}
		
		this.ctx.drawImage(this.originalImage, drawX, drawY, drawWidth, drawHeight);
	}
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	new ImageResizer();
});
