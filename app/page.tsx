"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import {
  FolderOpen,
  Download,
  Save,
  Upload,
  Images,
  Keyboard,
  X,
  Pause,
  Heart,
  HeartCrack,
  PauseCircle,
  Check,
  Plus,
} from "lucide-react"

interface PhotoFile extends File {
  eventTag?: string
}

interface PhotoState {
  name: string
  state: "pending" | "accepted" | "rejected" | "hold" | "skipped"
  eventTag?: string
}

interface SaveData {
  timestamp: string
  photoStates: PhotoState[]
  currentIndex: number
  customAlbums: string[]
}

const getAlbumColor = (albumName: string, index: number) => {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-yellow-500",
    "bg-cyan-500",
  ]
  return colors[index % colors.length]
}

const getBorderColor = (albumName: string, index: number) => {
  const colors = [
    "border-l-red-500",
    "border-l-blue-500",
    "border-l-green-500",
    "border-l-purple-500",
    "border-l-orange-500",
    "border-l-pink-500",
    "border-l-indigo-500",
    "border-l-teal-500",
    "border-l-yellow-500",
    "border-l-cyan-500",
  ]
  return colors[index % colors.length]
}

export default function PhotoSelector() {
  // State management
  const [photos, setPhotos] = useState<PhotoFile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [acceptedPhotos, setAcceptedPhotos] = useState<PhotoFile[]>([])
  const [rejectedPhotos, setRejectedPhotos] = useState<PhotoFile[]>([])
  const [holdPhotos, setHoldPhotos] = useState<PhotoFile[]>([])
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [currentFilter, setCurrentFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("main")
  const [showTagModal, setShowTagModal] = useState(false)
  const [pendingHoldPhoto, setPendingHoldPhoto] = useState<{ photo: PhotoFile; index: number } | null>(null)

  const [customAlbums, setCustomAlbums] = useState<string[]>(["favourite", "to-post", "road-trip", "goa", "ladakh"])
  const [showCreateAlbum, setShowCreateAlbum] = useState(false)
  const [newAlbumName, setNewAlbumName] = useState("")

  const events = customAlbums

  const eventCounts = events.reduce(
    (acc, event) => {
      acc[event] = acceptedPhotos.filter((photo) => photo.eventTag === event).length
      return acc
    },
    {} as Record<string, number>,
  )

  const createNewAlbum = () => {
    if (!newAlbumName.trim()) {
      alert("Please enter an album name.")
      return
    }

    const albumName = newAlbumName.trim().toLowerCase().replace(/\s+/g, "-")

    if (customAlbums.includes(albumName)) {
      alert("Album with this name already exists.")
      return
    }

    setCustomAlbums((prev) => [...prev, albumName])
    setNewAlbumName("")
    setShowCreateAlbum(false)
  }

  const deleteAlbum = (albumToDelete: string) => {
    if (customAlbums.length <= 1) {
      alert("You must have at least one album.")
      return
    }

    const hasPhotos = acceptedPhotos.some((photo) => photo.eventTag === albumToDelete)
    if (hasPhotos) {
      if (confirm(`Album "${albumToDelete}" contains photos. Delete anyway?`)) {
        setAcceptedPhotos((prev) =>
          prev.map((photo) => (photo.eventTag === albumToDelete ? { ...photo, eventTag: undefined } : photo)),
        )
        setCustomAlbums((prev) => prev.filter((album) => album !== albumToDelete))
        if (currentFilter === albumToDelete) {
          setCurrentFilter("all")
        }
        if (selectedTag === albumToDelete) {
          setSelectedTag(null)
        }
      }
      return
    }

    setCustomAlbums((prev) => prev.filter((album) => album !== albumToDelete))
    if (currentFilter === albumToDelete) {
      setCurrentFilter("all")
    }
    if (selectedTag === albumToDelete) {
      setSelectedTag(null)
    }
  }

  // Handle folder selection
  const handleFolderSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).filter((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase()
      return ["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")
    }) as PhotoFile[]

    if (files.length === 0) {
      alert("No image files found in the selected folder.")
      return
    }

    // Reset state
    setPhotos(files)
    setCurrentIndex(0)
    setAcceptedPhotos([])
    setRejectedPhotos([])
    setHoldPhotos([])
    setSelectedTag(null)
  }

  // Process current photo
  const processPhoto = (action: "accept" | "reject" | "hold") => {
    if (photos.length === 0 || currentIndex >= photos.length) return

    const currentPhoto = photos[currentIndex]

    switch (action) {
      case "accept":
        if (!selectedTag) {
          alert("Please select a category tag before accepting the photo.")
          return
        }
        currentPhoto.eventTag = selectedTag
        setAcceptedPhotos((prev) => [...prev, currentPhoto])
        break
      case "reject":
        setRejectedPhotos((prev) => [...prev, currentPhoto])
        break
      case "hold":
        setHoldPhotos((prev) => [...prev, currentPhoto])
        break
    }

    setCurrentIndex((prev) => prev + 1)
    setSelectedTag(null)
  }

  // Handle keyboard navigation
  const handleKeyNavigation = useCallback(
    (event: KeyboardEvent) => {
      if (photos.length === 0 || currentIndex >= photos.length || activeTab !== "main") return

      switch (event.key) {
        case "ArrowLeft":
          if (currentIndex > 0) setCurrentIndex((prev) => prev - 1)
          break
        case "ArrowRight":
          if (currentIndex < photos.length - 1) setCurrentIndex((prev) => prev + 1)
          break
        case "1":
        case "a":
          processPhoto("accept")
          break
        case "2":
        case "h":
          processPhoto("hold")
          break
        case "3":
        case "r":
          processPhoto("reject")
          break
      }
    },
    [photos.length, currentIndex, activeTab, selectedTag],
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyNavigation)
    return () => document.removeEventListener("keydown", handleKeyNavigation)
  }, [handleKeyNavigation])

  // Export accepted photos
  const exportAcceptedPhotos = () => {
    if (acceptedPhotos.length === 0) return

    const eventGroups = events.reduce(
      (acc, event) => {
        acc[event] = acceptedPhotos.filter((photo) => photo.eventTag === event).map((photo) => photo.name)
        return acc
      },
      {} as Record<string, string[]>,
    )

    let content = "# Selected Photos by Category\n\n"

    Object.entries(eventGroups).forEach(([event, files]) => {
      if (files.length > 0) {
        content += `## ${event.charAt(0).toUpperCase() + event.slice(1).replace("-", " ")}\n`
        files.forEach((filename) => (content += `${filename}\n`))
        content += "\n"
      }
    })

    content += "# Summary\n"
    content += `Total photos: ${acceptedPhotos.length}\n`
    Object.entries(eventGroups).forEach(([event, files]) => {
      if (files.length > 0) {
        content += `${event.charAt(0).toUpperCase() + event.slice(1).replace("-", " ")}: ${files.length} photos\n`
      }
    })

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "selected_photos.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  const saveProgress = () => {
    if (photos.length === 0) return

    const photoStates: PhotoState[] = photos.map((file, index) => {
      let state: PhotoState["state"] = "pending"
      let eventTag = undefined

      if (acceptedPhotos.includes(file)) {
        state = "accepted"
        eventTag = file.eventTag
      } else if (rejectedPhotos.includes(file)) {
        state = "rejected"
      } else if (holdPhotos.includes(file)) {
        state = "hold"
      } else if (index < currentIndex) {
        state = "skipped"
      }

      return { name: file.name, state, eventTag }
    })

    const saveData: SaveData = {
      timestamp: new Date().toISOString(),
      photoStates,
      currentIndex,
      customAlbums,
    }

    localStorage.setItem("photoSelector", JSON.stringify(saveData))
    alert("Progress saved successfully!")
  }

  const loadProgress = () => {
    const savedData = localStorage.getItem("photoSelector")
    if (!savedData) {
      alert("No saved progress found.")
      return
    }

    try {
      const data: SaveData = JSON.parse(savedData)
      if (data.customAlbums) {
        setCustomAlbums(data.customAlbums)
      }
    } catch (error) {
      console.error("Error loading saved data:", error)
    }

    alert("Please select the same folder of photos to restore your progress.")
    document.getElementById("folder-input")?.click()
  }

  // Remove from accepted
  const removeFromAccepted = (index: number) => {
    setAcceptedPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  // Remove from hold
  const removeFromHold = (index: number) => {
    setHoldPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  // Accept from hold
  const acceptFromHold = (photo: PhotoFile, index: number) => {
    setPendingHoldPhoto({ photo, index })
    setShowTagModal(true)
  }

  // Handle tag selection for hold photo
  const handleTagSelection = (eventTag: string) => {
    if (pendingHoldPhoto) {
      const { photo, index } = pendingHoldPhoto
      photo.eventTag = eventTag
      setHoldPhotos((prev) => prev.filter((_, i) => i !== index))
      setAcceptedPhotos((prev) => [...prev, photo])
      setPendingHoldPhoto(null)
    }
    setShowTagModal(false)
  }

  const currentPhoto = photos[currentIndex]
  const filteredAcceptedPhotos =
    currentFilter === "all" ? acceptedPhotos : acceptedPhotos.filter((photo) => photo.eventTag === currentFilter)

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="max-w-7xl mx-auto p-5">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-5 gap-4">
          <h1 className="text-3xl font-bold text-red-400">Photo Sorter</h1>
          <div className="flex flex-wrap gap-2">
            <label className="bg-gray-800 text-white px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 hover:opacity-90 hover:-translate-y-0.5 transition-all">
              <FolderOpen size={16} />
              Load Photos
              <input
                id="folder-input"
                type="file"
                webkitdirectory=" "
                multiple
                className="hidden"
                onChange={handleFolderSelect}
              />
            </label>
            <button
              onClick={exportAcceptedPhotos}
              disabled={acceptedPhotos.length === 0}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 hover:-translate-y-0.5 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Download size={16} />
              Export Selected
            </button>
            <button
              onClick={saveProgress}
              disabled={photos.length === 0}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 hover:-translate-y-0.5 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Save size={16} />
              Save Progress
            </button>
            <button
              onClick={loadProgress}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 hover:-translate-y-0.5 transition-all"
            >
              <Upload size={16} />
              Load Progress
            </button>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-5">
          {/* Event Statistics Sidebar */}
          <div className="w-full lg:w-48 bg-white p-4 rounded-lg shadow-md h-fit">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Albums</h3>
              <button
                onClick={() => setShowCreateAlbum(true)}
                className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors"
                title="Create new album"
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {events.map((event, index) => (
                <div
                  key={event}
                  className={`flex justify-between items-center p-2 rounded-lg bg-gray-50 border-l-4 ${getBorderColor(event, index)} group`}
                >
                  <span className="text-lg font-bold">{eventCounts[event]}</span>
                  <div className="flex items-center gap-1">
                    <span className="capitalize text-sm">{event.replace("-", " ")}</span>
                    <button
                      onClick={() => deleteAlbum(event)}
                      className="w-4 h-4 rounded-full bg-red-400 text-white items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex"
                      title="Delete album"
                    >
                      <X size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Stats */}
            <div className="flex justify-around bg-white p-4 rounded-lg shadow-md mb-5">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold">{photos.length}</span>
                <span>Total</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold">{acceptedPhotos.length}</span>
                <span>Accepted</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold">{rejectedPhotos.length}</span>
                <span>Rejected</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold">{holdPhotos.length}</span>
                <span>On Hold</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-5">
              {[
                { id: "main", label: "Main" },
                { id: "accepted", label: "Accepted" },
                { id: "hold", label: "On Hold" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2 rounded-lg border transition-all ${
                    activeTab === tab.id ? "bg-gray-800 text-white" : "bg-white border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "main" && (
              <div className="bg-white rounded-lg shadow-md p-3 sm:p-5">
                {photos.length === 0 ? (
                  <div className="text-center text-gray-400 flex flex-col items-center gap-2 py-20">
                    <Images size={48} />
                    <p>Load photos to get started</p>
                  </div>
                ) : currentIndex >= photos.length ? (
                  <div className="text-center text-gray-400 flex flex-col items-center gap-2 py-20">
                    <Images size={48} />
                    <p>No more photos to review</p>
                  </div>
                ) : (
                  <div className="w-full max-w-4xl mx-auto">
                    <div className="text-center mb-3 text-gray-400 text-xs sm:text-sm flex items-center justify-center gap-2">
                      <Keyboard size={16} />
                      <span className="hidden sm:inline">Use left/right arrow keys to navigate</span>
                      <span className="sm:hidden">Swipe or use buttons to navigate</span>
                    </div>

                    <div className="relative bg-gray-100 rounded-lg overflow-hidden shadow-lg mb-4">
                      <div className="w-full h-[40vh] sm:h-[45vh] lg:h-[50vh] flex items-center justify-center">
                        <img
                          src={URL.createObjectURL(currentPhoto) || "/placeholder.svg"}
                          alt="Photo for sorting"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs sm:text-sm">
                        {currentIndex + 1} / {photos.length}
                      </div>
                    </div>

                    <div className="text-center mb-4 text-xs sm:text-sm text-gray-600 px-2">
                      <div className="truncate max-w-full" title={currentPhoto.name}>
                        {currentPhoto.name}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Action Buttons - Fixed position */}
                      <div className="flex justify-center items-center gap-4 sm:gap-6 py-4">
                        <button
                          onClick={() => processPhoto("reject")}
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all duration-200 active:scale-95"
                          title="Reject (Press 3 or R)"
                        >
                          <X size={20} className="sm:w-6 sm:h-6" />
                        </button>
                        <button
                          onClick={() => processPhoto("hold")}
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all duration-200 active:scale-95"
                          title="Hold (Press 2 or H)"
                        >
                          <Pause size={20} className="sm:w-6 sm:h-6" />
                        </button>
                        <button
                          onClick={() => processPhoto("accept")}
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all duration-200 active:scale-95"
                          title="Accept (Press 1 or A)"
                        >
                          <Heart size={20} className="sm:w-6 sm:h-6" />
                        </button>
                      </div>

                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border">
                        <h4 className="text-sm sm:text-base font-semibold text-center mb-3 text-gray-700">
                          Select Album <span className="text-red-500">*</span>
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                          {events.map((event, index) => (
                            <button
                              key={event}
                              onClick={() => setSelectedTag(event)}
                              className={`p-2 sm:p-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 border-2 ${
                                selectedTag === event
                                  ? `${getAlbumColor(event, index)} text-white border-transparent shadow-md scale-105`
                                  : "bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 text-gray-700"
                              }`}
                            >
                              {event.charAt(0).toUpperCase() + event.slice(1).replace("-", " ")}
                            </button>
                          ))}
                        </div>
                        {!selectedTag && (
                          <p className="text-xs text-red-500 text-center mt-2">
                            Please select an album before accepting
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "accepted" && (
              <div>
                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span>Filter by album:</span>
                  <button
                    onClick={() => setCurrentFilter("all")}
                    className={`px-3 py-1 rounded-lg text-sm border transition-all ${
                      currentFilter === "all" ? "bg-gray-800 text-white" : "bg-white border-gray-300"
                    }`}
                  >
                    All
                  </button>
                  {events.map((event, index) => (
                    <button
                      key={event}
                      onClick={() => setCurrentFilter(event)}
                      className={`px-3 py-1 rounded-lg text-sm border transition-all capitalize ${
                        currentFilter === event
                          ? `${getAlbumColor(event, index)} text-white`
                          : "bg-white border-gray-300"
                      }`}
                    >
                      {event.replace("-", " ")}
                    </button>
                  ))}
                </div>

                {/* Gallery */}
                {filteredAcceptedPhotos.length === 0 ? (
                  <div className="text-center text-gray-400 flex flex-col items-center gap-2 py-20">
                    <HeartCrack size={48} />
                    <p>{currentFilter === "all" ? "No accepted photos yet" : `No photos in ${currentFilter} album`}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredAcceptedPhotos.map((photo, index) => (
                      <div key={index} className="relative rounded-lg overflow-hidden shadow-md">
                        <img
                          src={URL.createObjectURL(photo) || "/placeholder.svg"}
                          alt={photo.name}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2 text-xs truncate">
                          {photo.name}
                        </div>
                        {photo.eventTag && (
                          <div
                            className={`absolute top-0 right-0 px-2 py-1 text-xs text-white font-bold capitalize ${getAlbumColor(photo.eventTag, events.indexOf(photo.eventTag))}`}
                          >
                            {photo.eventTag.replace("-", " ")}
                          </div>
                        )}
                        <div className="absolute top-1 left-1">
                          <button
                            onClick={() => removeFromAccepted(index)}
                            className="w-8 h-8 rounded-full bg-red-400 text-white flex items-center justify-center text-xs"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "hold" && (
              <div>
                {holdPhotos.length === 0 ? (
                  <div className="text-center text-gray-400 flex flex-col items-center gap-2 py-20">
                    <PauseCircle size={48} />
                    <p>No photos on hold</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {holdPhotos.map((photo, index) => (
                      <div key={index} className="relative rounded-lg overflow-hidden shadow-md">
                        <img
                          src={URL.createObjectURL(photo) || "/placeholder.svg"}
                          alt={photo.name}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2 text-xs truncate">
                          {photo.name}
                        </div>
                        <div className="absolute top-1 left-1 flex gap-1">
                          <button
                            onClick={() => acceptFromHold(photo, index)}
                            className="w-8 h-8 rounded-full bg-teal-400 text-white flex items-center justify-center text-xs"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={() => removeFromHold(index)}
                            className="w-8 h-8 rounded-full bg-red-400 text-white flex items-center justify-center text-xs"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreateAlbum && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Create New Album</h3>
            <input
              type="text"
              value={newAlbumName}
              onChange={(e) => setNewAlbumName(e.target.value)}
              placeholder="Enter album name..."
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === "Enter" && createNewAlbum()}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowCreateAlbum(false)
                  setNewAlbumName("")
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createNewAlbum}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Create Album
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tag Selection Modal */}
      {showTagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-center font-semibold mb-4">Select an album</h3>
            <div className="grid grid-cols-2 gap-2">
              {events.map((event, index) => (
                <button
                  key={event}
                  onClick={() => handleTagSelection(event)}
                  className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors capitalize"
                >
                  {event.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
