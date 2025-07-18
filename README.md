#Photo Sorter
https://photo-selector.vercel.app/
A simple, Tinder-like application for selecting photos for your wedding album. This app allows you to quickly sort through your wedding photos by accepting, rejecting, or putting them on hold for later review.

## Features

- **Load Photos**: Select a folder of images to review
- **Swipe Interface**: Accept, reject, or put photos on hold with intuitive buttons
- **Event Tagging**: Tag photos by event (Mehendi, Haldi, Cocktail, Myra, Marriage)
- **Event Statistics**: View counts of photos by event category
- **Keyboard Navigation**: Use arrow keys to browse photos without making decisions
- **Organized Tabs**: Easily switch between main selection, accepted photos, and photos on hold
- **Filter by Event**: Filter accepted photos by event tag
- **Export Selected**: Download a text file with the filenames of all accepted photos, organized by event
- **Save Progress**: Save your current selection state to continue later
- **Responsive Design**: Works on desktop and mobile devices

## How to Use

1. **Open the App**: Simply open the `index.html` file in any modern web browser
2. **Load Photos**: Click the "Load Photos" button and select a folder containing your wedding photos
3. **Review Photos**: For each photo, you can:
   - **Navigate**: Use left/right arrow keys to browse without making a decision
   - **Tag**: Select an event tag from the options on the right (required for accepting)
   - **Choose Action**:
     - ❤️ (Accept): Add the photo to your wedding album selection (keyboard: 1 or A)
     - ⏸️ (Hold): Put the photo on hold for later review (keyboard: 2 or H)
     - ❌ (Reject): Remove the photo from consideration (keyboard: 3 or R)
4. **View Statistics**: See counts of photos by event category on the left side
5. **View Selections**: Use the tabs to switch between the main review screen, accepted photos, and photos on hold
6. **Filter Accepted Photos**: In the Accepted tab, use the filter buttons to view photos by event
7. **Save Progress**: Click "Save Progress" to store your current selections in your browser's local storage
8. **Resume Later**: When you return, click "Load Progress" and select the same folder of photos to continue where you left off
9. **Export Results**: When finished, click "Export Selected" to download a text file with all the filenames of your accepted photos, organized by event

## Keyboard Shortcuts

- **Left Arrow**: Previous photo
- **Right Arrow**: Next photo
- **1 or A**: Accept photo (requires event tag)
- **2 or H**: Put photo on hold
- **3 or R**: Reject photo

## Technical Details

This application is built with vanilla HTML, CSS, and JavaScript. It uses:

- Modern JavaScript (ES6+)
- Local Storage API for saving progress
- File API for handling photos
- CSS Grid and Flexbox for responsive layout

## Privacy

All processing happens locally in your browser. Your photos are never uploaded to any server, and your selections are stored only in your browser's local storage.

## Browser Compatibility

This app works best in modern browsers like:

- Chrome (recommended)
- Firefox
- Edge
- Safari

## Limitations

- The app can only access photos you explicitly select through the file picker
- The number of photos you can process may be limited by your device's memory
- Local storage has size limitations, so extremely large collections might not save properly
