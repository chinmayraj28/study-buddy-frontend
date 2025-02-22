import React, { useState, useEffect } from 'react';

const CircleWindow = ({ activeWindow, onClose, todos, setTodos }) => {
  const [currentNote, setCurrentNote] = useState('');
  const [savedNotes, setSavedNotes] = useState([]);
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [activeTab, setActiveTab] = useState('write');
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => {
    const storedNotes = localStorage.getItem('savedNotes');
    if (storedNotes) {
      setSavedNotes(JSON.parse(storedNotes));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('savedNotes', JSON.stringify(savedNotes));
  }, [savedNotes]);

  const handleNoteSave = () => {
    if (currentNote.trim()) {
      const newNote = {
        id: Date.now(),
        content: currentNote,
        date: new Date().toLocaleDateString(),
        preview: currentNote.split('\n')[0].slice(0, 100) // Get first line as preview
      };
      setSavedNotes([newNote, ...savedNotes]);
      setCurrentNote('');
      setShowSaveButton(false);
    }
  };

  const handleNoteChange = (e) => {
    setCurrentNote(e.target.value);
    setShowSaveButton(e.target.value.trim() !== '');
  };

  const handleDeleteNote = (id) => {
    setSavedNotes(savedNotes.filter(note => note.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(null);
    }
  };

  const handleNoteClick = (note) => {
    setSelectedNote(note);
  };

  const renderNotesContent = () => {
    return (
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            className={`px-4 py-2 ${activeTab === 'write' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('write')}
          >
            Write Note
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'saved' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('saved')}
          >
            Saved Notes
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'write' ? (
          <div className="space-y-4">
            <textarea
              className="w-full h-64 p-2 border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Start taking notes..."
              value={currentNote}
              onChange={handleNoteChange}
            ></textarea>
            {showSaveButton && (
              <button
                onClick={handleNoteSave}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Save Note
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {savedNotes.length === 0 ? (
              <p className="text-gray-500">No saved notes yet</p>
            ) : (
              savedNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => handleNoteClick(note)}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-500">{note.date}</span>
                  </div>
                  <p className="line-clamp-1">{note.preview}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeWindow) {
      case "Note":
        return renderNotesContent();
      case "Timer":
        return (
          <FullscreenTimer 
            onClose={onClose} 
            todos={todos} 
            setTodos={setTodos} 
          />
        );
      case "Settings":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Notification Sound
                </label>
                <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                  <option>Chime</option>
                  <option>Bell</option>
                  <option>Ping</option>
                </select>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{activeWindow}</h2>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          {renderContent()}
        </div>
      </div>

      {/* Note Widget */}
      {selectedNote && (
        <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-gray-500">{selectedNote.date}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDeleteNote(selectedNote.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedNote(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            </div>
            <p className="whitespace-pre-wrap">{selectedNote.content}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default CircleWindow;