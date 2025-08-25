# Photo Selector App

A React-based photo sorting application built with Next.js and Tailwind CSS.

## Features

- Load photos from folders
- Sort photos into custom albums
- Create and manage custom albums
- Accept, reject, or hold photos
- Keyboard navigation support
- Export selected photos
- Save and load progress
- Mobile responsive design

## Setup Instructions

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn package manager

### Installation Steps

1. **Extract the project files** to your desired directory

2. **Navigate to the project directory**
   \`\`\`bash
   cd photo-selector
   \`\`\`

3. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

4. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

5. **Open your browser** and go to `http://localhost:3000`

### Building for Production

To create a production build:

\`\`\`bash
npm run build
npm start
\`\`\`

## Usage

1. Click "Load Photos" to select a folder containing images
2. Use the action buttons or keyboard shortcuts to sort photos:
   - **Accept**: Add photo to selected album (Press 1 or A)
   - **Hold**: Put photo on hold for later review (Press 2 or H)  
   - **Reject**: Remove photo from selection (Press 3 or R)
3. Create custom albums using the "+" button in the Albums sidebar
4. View accepted and held photos in their respective tabs
5. Export your selections or save progress for later

## Keyboard Shortcuts

- **Arrow Keys**: Navigate between photos
- **1 or A**: Accept current photo
- **2 or H**: Hold current photo
- **3 or R**: Reject current photo

## File Structure

\`\`\`
photo-selector/
├── app/
│   ├── page.tsx          # Main application component
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── package.json          # Dependencies and scripts
├── next.config.mjs       # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── README.md            # This file
