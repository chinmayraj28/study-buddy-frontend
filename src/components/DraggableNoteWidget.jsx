import { useState, useEffect, useRef } from "react"


const DraggableNoteWidget = ({ note, onClose, onDelete }) => {
  // Calculate a random position for new notes, keeping them in view
  const getRandomPosition = () => {
    const padding = 20; // Padding from screen edges
    const maxX = window.innerWidth - 384 - padding; // 384 is default width
    const maxY = window.innerHeight - 200 - padding; // 200 is default height
    
    return {
      x: padding + Math.random() * maxX,
      y: padding + Math.random() * (maxY - 100) // Subtract extra to avoid bottom dock
    };
  };

  const [position, setPosition] = useState(getRandomPosition())
  const [size, setSize] = useState({ width: 384, height: 200 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  
  const darkColors = [
    'rgba(47, 51, 73, 0.85)',
    'rgba(44, 52, 58, 0.85)',
    'rgba(51, 41, 51, 0.85)',
    'rgba(43, 52, 48, 0.85)',
    'rgba(54, 45, 45, 0.85)',
  ]
  
  const bgColor = useRef(darkColors[Math.floor(Math.random() * darkColors.length)])

  const handleMouseDown = (e) => {
    if (e.target.classList.contains('resize-handle')) {
      setIsResizing(true)
      dragStart.current = { x: e.clientX, y: e.clientY }
    } else {
      setIsDragging(true)
      dragStart.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      }
    }
  }

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.current.x;
      const newY = e.clientY - dragStart.current.y;
      
      // Keep the note within viewport bounds
      const maxX = window.innerWidth - size.width;
      const maxY = window.innerHeight - size.height;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    } else if (isResizing) {
      const dx = e.clientX - dragStart.current.x
      const dy = e.clientY - dragStart.current.y
      
      setSize(prevSize => ({
        width: Math.max(300, prevSize.width + dx),
        height: Math.max(150, prevSize.height + dy)
      }))
      
      dragStart.current = { x: e.clientX, y: e.clientY }
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
  }

  return (
    <div
      className="fixed rounded-lg shadow-lg overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        backgroundColor: bgColor.current,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="flex justify-between items-center p-3 border-b border-gray-600">
        <span className="text-sm text-gray-200">{formatDate(note.createdAt)}</span>
        <div className="flex gap-2">
          
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-gray-100 transition-colors"
          >
            ×
          </button>
        </div>
      </div>
      <div className="p-4 text-gray-100 overflow-auto" style={{ height: 'calc(100% - 48px)' }}>
        {note.content}
      </div>
      <div
        className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        style={{
          background: 'linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.3) 50%)'
        }}
      />
    </div>
  )
}

export default DraggableNoteWidget