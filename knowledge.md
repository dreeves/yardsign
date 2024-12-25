# Yard Sign Generator

## Purpose

This web app generates an elegant, full-screen yard sign display optimized for:
1. Wall-mounted tablets or displays
2. Real-time editing and reformatting

## Key Features

- Automatically scales to fill available screen space
- Click anywhere to edit sign text
- Real-time resizing of text as content changes
- Preserves proper spacing and formatting
- Shareable via URL

## Technical Implementation

- Uses fitty.js for dynamic text sizing
- Responsive scaling via transform
- Modal text editor with live preview
- URL parameters for sharing sign content

### Critical Initialization Order
- Font loading must complete before fitty initialization
- Each line needs individual fitty initialization
- Scale updates must follow fitty updates
- Multiple fitty.fitAll() calls may be needed for proper sizing

### Critical Initialization Order
- Font loading must complete before fitty initialization
- Each line needs individual fitty initialization
- Scale updates must follow fitty updates
- Multiple fitty.fitAll() calls may be needed for proper sizing

### Critical Initialization Order
- Font loading must complete before fitty initialization
- Each line needs individual fitty initialization
- Scale updates must follow fitty updates
- Multiple fitty.fitAll() calls may be needed for proper sizing

### Critical Initialization Order
- Font loading must complete before fitty initialization
- Each line needs individual fitty initialization
- Scale updates must follow fitty updates
- Multiple fitty.fitAll() calls may be needed for proper sizing

## Usage Tips

- Click anywhere on screen to edit text
- Each line auto-sizes independently
- Sign maintains aspect ratio while scaling
- HTML entities (like &nbsp;) can be used for fine-tuned spacing
