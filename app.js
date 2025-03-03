document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const folderInput = document.getElementById("folder-input");
  const exportBtn = document.getElementById("export-btn");
  const saveProgressBtn = document.getElementById("save-progress-btn");
  const loadProgressBtn = document.getElementById("load-progress-btn");
  const photoCard = document.getElementById("photo-card");
  const currentPhoto = document.getElementById("current-photo");
  const currentFilename = document.getElementById("current-filename");
  const noPhotosMessage = document.getElementById("no-photos-message");
  const acceptBtn = document.getElementById("accept-btn");
  const rejectBtn = document.getElementById("reject-btn");
  const holdBtn = document.getElementById("hold-btn");
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");
  const acceptedPhotosContainer = document.getElementById("accepted-photos");
  const holdPhotosContainer = document.getElementById("hold-photos");
  const noAcceptedMessage = document.getElementById("no-accepted-message");
  const noHoldMessage = document.getElementById("no-hold-message");
  const tagBtns = document.querySelectorAll(".tag-btn");
  const filterBtns = document.querySelectorAll(".filter-btn");

  // Counters
  const totalCount = document.getElementById("total-count");
  const acceptedCount = document.getElementById("accepted-count");
  const rejectedCount = document.getElementById("rejected-count");
  const holdCount = document.getElementById("hold-count");

  // Event Counters
  const mehendiCount = document.getElementById("mehendi-count");
  const haldiCount = document.getElementById("haldi-count");
  const cocktailCount = document.getElementById("cocktail-count");
  const myraCount = document.getElementById("myra-count");
  const marriageCount = document.getElementById("marriage-count");

  // App State
  let photos = [];
  let currentIndex = 0;
  let acceptedPhotos = [];
  let rejectedPhotos = [];
  let holdPhotos = [];
  let selectedTag = null;
  let currentFilter = "all";

  // Initialize
  updateCounters();

  // Event Listeners
  folderInput.addEventListener("change", handleFolderSelect);
  exportBtn.addEventListener("click", exportAcceptedPhotos);
  saveProgressBtn.addEventListener("click", saveProgress);
  loadProgressBtn.addEventListener("click", loadProgress);
  acceptBtn.addEventListener("click", () => processPhoto("accept"));
  rejectBtn.addEventListener("click", () => processPhoto("reject"));
  holdBtn.addEventListener("click", () => processPhoto("hold"));

  // Add event listeners for tag buttons
  tagBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const event = btn.getAttribute("data-event");
      selectTag(event);
    });
  });

  // Add event listeners for filter buttons
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter");
      filterAcceptedPhotos(filter);
    });
  });

  // Add keyboard navigation
  document.addEventListener("keydown", handleKeyNavigation);

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabName = btn.getAttribute("data-tab");
      switchTab(tabName);
    });
  });

  // Handle keyboard navigation
  function handleKeyNavigation(event) {
    if (photos.length === 0 || currentIndex >= photos.length) return;

    // Only handle keyboard navigation when on the main tab
    const mainTab = document.getElementById("main-tab");
    if (!mainTab.classList.contains("active")) return;

    if (event.key === "ArrowLeft") {
      // Navigate to previous photo
      if (currentIndex > 0) {
        currentIndex--;
        showPhoto(currentIndex);
      }
    } else if (event.key === "ArrowRight") {
      // Navigate to next photo
      if (currentIndex < photos.length - 1) {
        currentIndex++;
        showPhoto(currentIndex);
      }
    } else if (event.key === "1" || event.key === "a") {
      // Accept photo
      processPhoto("accept");
    } else if (event.key === "2" || event.key === "h") {
      // Hold photo
      processPhoto("hold");
    } else if (event.key === "3" || event.key === "r") {
      // Reject photo
      processPhoto("reject");
    }
  }

  // Select a tag for the current photo
  function selectTag(event) {
    selectedTag = event;

    // Update UI to show selected tag
    tagBtns.forEach((btn) => {
      if (btn.getAttribute("data-event") === event) {
        btn.classList.add("selected");
      } else {
        btn.classList.remove("selected");
      }
    });
  }

  // Filter accepted photos by event
  function filterAcceptedPhotos(filter) {
    currentFilter = filter;

    // Update UI to show selected filter
    filterBtns.forEach((btn) => {
      if (btn.getAttribute("data-filter") === filter) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Update the gallery
    updateAcceptedGallery();
  }

  // Handle folder selection
  function handleFolderSelect(event) {
    const files = Array.from(event.target.files).filter((file) => {
      const extension = file.name.split(".").pop().toLowerCase();
      return ["jpg", "jpeg", "png", "gif", "webp"].includes(extension);
    });

    if (files.length === 0) {
      alert("No image files found in the selected folder.");
      return;
    }

    // Reset state
    photos = files;
    currentIndex = 0;
    acceptedPhotos = [];
    rejectedPhotos = [];
    holdPhotos = [];

    // Update UI
    updateCounters();
    exportBtn.disabled = true;
    saveProgressBtn.disabled = false;

    // Show first photo
    showPhoto(currentIndex);
  }

  // Show photo at given index
  function showPhoto(index) {
    if (photos.length === 0) {
      photoCard.classList.add("hidden");
      noPhotosMessage.classList.remove("hidden");
      return;
    }

    if (index >= photos.length) {
      photoCard.classList.add("hidden");
      noPhotosMessage.classList.remove("hidden");
      noPhotosMessage.querySelector("p").textContent =
        "No more photos to review";
      return;
    }

    const file = photos[index];
    const url = URL.createObjectURL(file);

    currentPhoto.src = url;
    currentFilename.textContent = file.name;

    // Reset selected tag
    selectedTag = null;
    tagBtns.forEach((btn) => btn.classList.remove("selected"));

    // Check if this photo already has a tag (from saved progress)
    if (file.eventTag) {
      selectTag(file.eventTag);
    }

    photoCard.classList.remove("hidden");
    noPhotosMessage.classList.add("hidden");
  }

  // Process current photo (accept, reject, or hold)
  function processPhoto(action) {
    if (photos.length === 0 || currentIndex >= photos.length) return;

    const currentPhoto = photos[currentIndex];

    switch (action) {
      case "accept":
        // Check if a tag is selected
        if (!selectedTag) {
          alert("Please select an event tag before accepting the photo.");
          return;
        }

        // Store the selected tag with the photo
        currentPhoto.eventTag = selectedTag;
        acceptedPhotos.push(currentPhoto);
        updateAcceptedGallery();
        break;
      case "reject":
        rejectedPhotos.push(currentPhoto);
        break;
      case "hold":
        holdPhotos.push(currentPhoto);
        updateHoldGallery();
        break;
    }

    currentIndex++;
    updateCounters();
    showPhoto(currentIndex);

    // Enable export button if we have accepted photos
    exportBtn.disabled = acceptedPhotos.length === 0;
  }

  // Update counters
  function updateCounters() {
    totalCount.textContent = photos.length;
    acceptedCount.textContent = acceptedPhotos.length;
    rejectedCount.textContent = rejectedPhotos.length;
    holdCount.textContent = holdPhotos.length;

    // Update event counters
    const eventCounts = {
      mehendi: 0,
      haldi: 0,
      cocktail: 0,
      myra: 0,
      marriage: 0,
    };

    // Count photos by event
    acceptedPhotos.forEach((photo) => {
      if (photo.eventTag) {
        eventCounts[photo.eventTag]++;
      }
    });

    // Update the UI
    mehendiCount.textContent = eventCounts.mehendi;
    haldiCount.textContent = eventCounts.haldi;
    cocktailCount.textContent = eventCounts.cocktail;
    myraCount.textContent = eventCounts.myra;
    marriageCount.textContent = eventCounts.marriage;

    // Show/hide empty state messages
    if (acceptedPhotos.length === 0) {
      noAcceptedMessage.classList.remove("hidden");
    } else {
      noAcceptedMessage.classList.add("hidden");
    }

    if (holdPhotos.length === 0) {
      noHoldMessage.classList.remove("hidden");
    } else {
      noHoldMessage.classList.add("hidden");
    }
  }

  // Update accepted photos gallery
  function updateAcceptedGallery() {
    acceptedPhotosContainer.innerHTML = "";

    // Filter photos based on current filter
    const filteredPhotos = acceptedPhotos.filter((photo) => {
      return currentFilter === "all" || photo.eventTag === currentFilter;
    });

    if (filteredPhotos.length === 0) {
      noAcceptedMessage.classList.remove("hidden");
      if (currentFilter !== "all") {
        noAcceptedMessage.querySelector(
          "p"
        ).textContent = `No photos tagged as ${currentFilter}`;
      } else {
        noAcceptedMessage.querySelector("p").textContent =
          "No accepted photos yet";
      }
    } else {
      noAcceptedMessage.classList.add("hidden");
    }

    filteredPhotos.forEach((file, index) => {
      const url = URL.createObjectURL(file);
      const item = createGalleryItem(
        url,
        file.name,
        index,
        "accepted",
        file.eventTag
      );
      acceptedPhotosContainer.appendChild(item);
    });
  }

  // Update hold photos gallery
  function updateHoldGallery() {
    holdPhotosContainer.innerHTML = "";

    holdPhotos.forEach((file, index) => {
      const url = URL.createObjectURL(file);
      const item = createGalleryItem(url, file.name, index, "hold");
      holdPhotosContainer.appendChild(item);
    });
  }

  // Create gallery item
  function createGalleryItem(url, filename, index, type, eventTag) {
    const div = document.createElement("div");
    div.className = "gallery-item";

    const img = document.createElement("img");
    img.src = url;
    img.alt = filename;

    const filenameDiv = document.createElement("div");
    filenameDiv.className = "filename";
    filenameDiv.textContent = filename;

    div.appendChild(img);
    div.appendChild(filenameDiv);

    // Add event tag if available
    if (eventTag) {
      const tagDiv = document.createElement("div");
      tagDiv.className = "event-tag";
      tagDiv.setAttribute("data-event", eventTag);
      tagDiv.textContent = eventTag.charAt(0).toUpperCase() + eventTag.slice(1);
      div.appendChild(tagDiv);
    }

    // Add action buttons based on type
    if (type === "accepted") {
      const removeBtn = document.createElement("button");
      removeBtn.className = "action-btn reject";
      removeBtn.innerHTML = '<i class="fas fa-times"></i>';
      removeBtn.addEventListener("click", () => {
        acceptedPhotos.splice(index, 1);
        updateAcceptedGallery();
        updateCounters();
        exportBtn.disabled = acceptedPhotos.length === 0;
      });

      const actionsDiv = document.createElement("div");
      actionsDiv.className = "actions";
      actionsDiv.appendChild(removeBtn);
      div.appendChild(actionsDiv);
    } else if (type === "hold") {
      const acceptBtn = document.createElement("button");
      acceptBtn.className = "action-btn accept";
      acceptBtn.innerHTML = '<i class="fas fa-check"></i>';
      acceptBtn.addEventListener("click", () => {
        // When accepting from hold, we need to select an event tag
        const photo = holdPhotos[index];

        // Create a simple modal for tag selection
        const modal = document.createElement("div");
        modal.className = "tag-selection-modal";
        modal.innerHTML = `
                    <div class="modal-content">
                        <h3>Select an event tag</h3>
                        <div class="tag-options modal-tags">
                            <button class="tag-btn" data-event="mehendi">Mehendi</button>
                            <button class="tag-btn" data-event="haldi">Haldi</button>
                            <button class="tag-btn" data-event="cocktail">Cocktail</button>
                            <button class="tag-btn" data-event="myra">Myra</button>
                            <button class="tag-btn" data-event="marriage">Marriage</button>
                        </div>
                    </div>
                `;

        document.body.appendChild(modal);

        // Add event listeners to tag buttons in modal
        modal.querySelectorAll(".tag-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            const selectedEvent = btn.getAttribute("data-event");
            photo.eventTag = selectedEvent;

            // Move photo from hold to accepted
            holdPhotos.splice(index, 1);
            acceptedPhotos.push(photo);

            // Update UI
            updateHoldGallery();
            updateAcceptedGallery();
            updateCounters();
            exportBtn.disabled = acceptedPhotos.length === 0;

            // Remove modal
            document.body.removeChild(modal);
          });
        });
      });

      const removeBtn = document.createElement("button");
      removeBtn.className = "action-btn reject";
      removeBtn.innerHTML = '<i class="fas fa-times"></i>';
      removeBtn.addEventListener("click", () => {
        holdPhotos.splice(index, 1);
        updateHoldGallery();
        updateCounters();
      });

      const actionsDiv = document.createElement("div");
      actionsDiv.className = "actions";
      actionsDiv.appendChild(acceptBtn);
      actionsDiv.appendChild(removeBtn);
      div.appendChild(actionsDiv);
    }

    return div;
  }

  // Switch between tabs
  function switchTab(tabName) {
    tabBtns.forEach((btn) => {
      if (btn.getAttribute("data-tab") === tabName) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    tabContents.forEach((content) => {
      if (content.id === `${tabName}-tab`) {
        content.classList.add("active");
      } else {
        content.classList.remove("active");
      }
    });
  }

  // Export accepted photos as a text file
  function exportAcceptedPhotos() {
    if (acceptedPhotos.length === 0) return;

    // Group filenames by event
    const eventGroups = {
      mehendi: [],
      haldi: [],
      cocktail: [],
      myra: [],
      marriage: [],
      untagged: [],
    };

    acceptedPhotos.forEach((file) => {
      if (file.eventTag) {
        eventGroups[file.eventTag].push(file.name);
      } else {
        eventGroups.untagged.push(file.name);
      }
    });

    // Create content with event grouping
    let content = "# Wedding Photos by Event\n\n";

    for (const [event, files] of Object.entries(eventGroups)) {
      if (files.length > 0) {
        content += `## ${event.charAt(0).toUpperCase() + event.slice(1)}\n`;
        files.forEach((filename) => {
          content += `${filename}\n`;
        });
        content += "\n";
      }
    }

    // Add a summary
    content += "# Summary\n";
    content += `Total photos: ${acceptedPhotos.length}\n`;
    for (const [event, files] of Object.entries(eventGroups)) {
      if (files.length > 0) {
        content += `${event.charAt(0).toUpperCase() + event.slice(1)}: ${
          files.length
        } photos\n`;
      }
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "wedding_photos.txt";
    a.click();

    URL.revokeObjectURL(url);
  }

  // Save progress to local storage
  function saveProgress() {
    if (photos.length === 0) return;

    // We can't store File objects directly in localStorage,
    // so we'll store the state of each photo (accepted, rejected, hold)
    const photoStates = photos.map((file, index) => {
      let state = "pending";
      let eventTag = null;

      if (acceptedPhotos.includes(file)) {
        state = "accepted";
        eventTag = file.eventTag;
      } else if (rejectedPhotos.includes(file)) {
        state = "rejected";
      } else if (holdPhotos.includes(file)) {
        state = "hold";
      } else if (index < currentIndex) {
        state = "skipped";
      }

      return {
        name: file.name,
        state,
        eventTag,
      };
    });

    // Store the current state
    const saveData = {
      timestamp: new Date().toISOString(),
      photoStates,
      currentIndex,
    };

    localStorage.setItem("weddingPhotoSelector", JSON.stringify(saveData));
    alert("Progress saved successfully!");
  }

  // Load progress from local storage
  function loadProgress() {
    const savedData = localStorage.getItem("weddingPhotoSelector");

    if (!savedData) {
      alert("No saved progress found.");
      return;
    }

    // Ask user to select the same folder again
    alert("Please select the same folder of photos to restore your progress.");
    folderInput.click();

    // After folder selection, we'll apply the saved states
    folderInput.addEventListener(
      "change",
      function applyProgress(event) {
        folderInput.removeEventListener("change", applyProgress);

        try {
          const data = JSON.parse(savedData);
          const photoStates = data.photoStates;

          // Reset collections
          acceptedPhotos = [];
          rejectedPhotos = [];
          holdPhotos = [];

          // Apply states to photos
          photoStates.forEach((savedPhoto) => {
            const matchingPhoto = Array.from(event.target.files).find(
              (file) => file.name === savedPhoto.name
            );

            if (matchingPhoto) {
              // Restore event tag if available
              if (savedPhoto.eventTag) {
                matchingPhoto.eventTag = savedPhoto.eventTag;
              }

              switch (savedPhoto.state) {
                case "accepted":
                  acceptedPhotos.push(matchingPhoto);
                  break;
                case "rejected":
                  rejectedPhotos.push(matchingPhoto);
                  break;
                case "hold":
                  holdPhotos.push(matchingPhoto);
                  break;
              }
            }
          });

          // Restore current index if available
          if (data.currentIndex !== undefined) {
            currentIndex = data.currentIndex;
          } else {
            // Find the first pending photo
            currentIndex = 0;
            while (
              currentIndex < photos.length &&
              (acceptedPhotos.includes(photos[currentIndex]) ||
                rejectedPhotos.includes(photos[currentIndex]) ||
                holdPhotos.includes(photos[currentIndex]))
            ) {
              currentIndex++;
            }
          }

          // Update UI
          updateCounters();
          updateAcceptedGallery();
          updateHoldGallery();
          showPhoto(currentIndex);
          exportBtn.disabled = acceptedPhotos.length === 0;
          saveProgressBtn.disabled = false;

          alert("Progress restored successfully!");
        } catch (error) {
          console.error("Error restoring progress:", error);
          alert("Error restoring progress. Please try again.");
        }
      },
      { once: true }
    );
  }

  // Add CSS for the tag selection modal
  const style = document.createElement("style");
  style.textContent = `
        .tag-selection-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        
        .modal-content {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            max-width: 400px;
            width: 100%;
        }
        
        .modal-content h3 {
            margin-bottom: 15px;
            text-align: center;
        }
        
        .modal-tags {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }
    `;
  document.head.appendChild(style);
});
