import { useState, useEffect } from "react";
import "./index.css";

function App() {
  const [notes, setNotes] = useState([]);
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem("notes")) || [];
    setNotes(savedNotes);
    setDarkMode(JSON.parse(localStorage.getItem("darkMode")) || false);
  }, []);

  function saveNotes(updatedNotes) {
    setNotes(updatedNotes);
    localStorage.setItem("notes", JSON.stringify(updatedNotes));
  }

  function addNote() {
    if (currentNote.trim() === "") return;
    const newNote = { id: Date.now(), text: currentNote };
    saveNotes([...notes, newNote]);
    setCurrentNote("");
    setPopupOpen(false);
  }

  function deleteNote(id) {
    saveNotes(notes.filter((note) => note.id !== id));
  }

  function openEditPopup(id) {
    const noteToEdit = notes.find((note) => note.id === id);
    setEditingId(id);
    setCurrentNote(noteToEdit.text);
    setPopupOpen(true);
  }

  function updateNote() {
    saveNotes(notes.map((note) => (note.id === editingId ? { ...note, text: currentNote } : note)));
    setCurrentNote("");
    setEditingId(null);
    setPopupOpen(false);
  }

  function toggleDarkMode() {
    setDarkMode(!darkMode);
    localStorage.setItem("darkMode", JSON.stringify(!darkMode));
  }

  function onDragStart(event, id) {
    event.dataTransfer.setData("text/plain", id);
  }

  function onDrop(event) {
    const draggedId = event.dataTransfer.getData("text/plain");
    const reorderedNotes = [...notes];
    const draggedNoteIndex = reorderedNotes.findIndex((note) => note.id.toString() === draggedId);
    const targetIndex = notes.length;
    const [movedNote] = reorderedNotes.splice(draggedNoteIndex, 1);
    reorderedNotes.splice(targetIndex, 0, movedNote);
    saveNotes(reorderedNotes);
  }

  return (
    <div className={darkMode ? "dark-mode" : ""}>
      <div id="header">
        <button onClick={() => setPopupOpen(true)}>➕ New Note</button>
        <input type="text" placeholder="Search notes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        <button onClick={toggleDarkMode}>{darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}</button>
      </div>

      <ul id="notes-list" onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
        {notes
          .filter((note) => note.text.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((note) => (
            <li key={note.id} draggable="true" onDragStart={(e) => onDragStart(e, note.id)}>
              <span>{note.text}</span>
              <button onClick={() => openEditPopup(note.id)}>✏️ Edit</button>
              <button onClick={() => deleteNote(note.id)}>🗑️ Delete</button>
            </li>
          ))}
      </ul>

      {isPopupOpen && (
        <div id="popupContainer">
          <h1>{editingId ? "Edit Note" : "New Note"}</h1>
          <textarea placeholder="Write your note..." value={currentNote} onChange={(e) => setCurrentNote(e.target.value)} />
          <div id="popup-buttons">
            <button onClick={editingId ? updateNote : addNote}>{editingId ? "Update" : "Create"}</button>
            <button onClick={() => setPopupOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
