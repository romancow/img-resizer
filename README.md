# Image Resizer

An easy to use, fully browser-side image resizer perfect for creating Instagram posts and other social media content. No server required - all processing happens directly in your browser!

## ✨ Features

- 🖼️ **Drag & Drop Upload** - Simply drag images onto the app or click to browse
- 📐 **Multiple Size Presets** - Square (1:1), Portrait (3:4), Landscape (4:3)
- 🎨 **Smart Fitting Options** - Fill (crop to fit) or Fit (show entire image with background)
- 🌈 **Custom Background Colors** - Choose any color for the background when using fit mode
- 💾 **Multiple Export Formats** - Save as PNG, JPEG, or WebP
- 👀 **Live Preview** - See exactly how your image will look with SVG rendering
- 📱 **Responsive Design** - Works perfectly on mobile and desktop


## 🔄 Creating Releases

This project uses GitHub Actions to automatically create draft releases when version tags are pushed:

```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0
```

The workflow will:
- ✅ Create a draft release with auto-generated changelog
- 📦 Generate a source code zip archive
- 🗃️ Create a standalone HTML file with inlined CSS/JS
- 📋 Include detailed release notes with features and usage instructions

## 🛠️ Development

The project structure is simple:
```
src/
├── index.html    # Main HTML structure
├── styles.css    # Styling and responsive design
└── script.js     # Image processing logic
```
