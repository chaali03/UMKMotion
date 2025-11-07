#!/bin/bash

# Image Optimization Script for UMKMotion
echo "🚀 Starting image optimization..."

# Create optimized directory structure
mkdir -p public/asset/optimized/{umkm,maskot,Footer,dummy,Peta}

# Function to optimize images
optimize_image() {
    local input="$1"
    local output="$2"
    local quality="${3:-80}"
    
    echo "Optimizing: $input -> $output"
    npx sharp-cli resize 1200 1200 --input "$input" --output "$output" --format webp --quality "$quality" --fit inside
}

# Optimize UMKM images (high quality for gallery)
for img in public/asset/umkm/*.{png,jpg,jpeg}; do
    if [[ -f "$img" ]]; then
        filename=$(basename "$img")
        name="${filename%.*}"
        optimize_image "$img" "public/asset/optimized/umkm/${name}.webp" 85
    fi
done

# Optimize maskot images (medium quality)
for img in public/asset/maskot/*.{png,jpg,jpeg}; do
    if [[ -f "$img" ]]; then
        filename=$(basename "$img")
        name="${filename%.*}"
        optimize_image "$img" "public/asset/optimized/maskot/${name}.webp" 80
    fi
done

# Optimize other assets (lower quality for backgrounds)
for img in public/asset/Footer/*.{png,jpg,jpeg}; do
    if [[ -f "$img" ]]; then
        filename=$(basename "$img")
        name="${filename%.*}"
        optimize_image "$img" "public/asset/optimized/Footer/${name}.webp" 75
    fi
done

for img in public/asset/dummy/*.{png,jpg,jpeg}; do
    if [[ -f "$img" ]]; then
        filename=$(basename "$img")
        name="${filename%.*}"
        optimize_image "$img" "public/asset/optimized/dummy/${name}.webp" 70
    fi
done

for img in public/asset/Peta/*.{png,jpg,jpeg}; do
    if [[ -f "$img" ]]; then
        filename=$(basename "$img")
        name="${filename%.*}"
        optimize_image "$img" "public/asset/optimized/Peta/${name}.webp" 75
    fi
done

# Optimize root level images
for img in public/asset/*.{png,jpg,jpeg}; do
    if [[ -f "$img" ]]; then
        filename=$(basename "$img")
        name="${filename%.*}"
        optimize_image "$img" "public/asset/optimized/${name}.webp" 80
    fi
done

# Calculate total savings
echo ""
echo "📊 Optimization Results:"
original_size=$(du -sh public/asset/ | cut -f1)
optimized_size=$(du -sh public/asset/optimized/ | cut -f1)
echo "Original size: $original_size"
echo "Optimized size: $optimized_size"

echo ""
echo "✅ Image optimization complete!"
echo "📁 Optimized images are in: public/asset/optimized/"
echo ""
echo "Next steps:"
echo "1. Update image imports to use optimized versions"
echo "2. Remove unused dependencies: npm uninstall motion @gsap/react leaflet react-leaflet"
echo "3. Update astro.config.mjs with build optimizations"
