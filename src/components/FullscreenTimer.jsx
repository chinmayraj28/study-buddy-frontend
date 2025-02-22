import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Edit2, X, Save, Trash2, CheckSquare, ChevronDown, ChevronRight, Plus 
} from 'lucide-react';

const FullscreenTimer = ({ onClose, todos, setTodos }) => {
  const [timeLeft, setTimeLeft] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableMinutes, setEditableMinutes] = useState("25");
  const [editableSeconds, setEditableSeconds] = useState("00");
  const [newTodo, setNewTodo] = useState("");
  const [newSubtasks, setNewSubtasks] = useState({});
  const [expandedTasks, setExpandedTasks] = useState({});
  const timerRef = useRef(null);
  const { server_url } = require("../config/config.json");

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  // Todo functions
  const handleSubtaskInputChange = (taskId, value) => {
    setNewSubtasks(prev => ({ ...prev, [taskId]: value }));
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${server_url}/todo`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTodo.trim()
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setTodos([...todos, result.todo]);
        setNewTodo("");
      }
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const addSubtask = async (taskId) => {
    if (newSubtasks[taskId]?.trim()) {
      const token = localStorage.getItem("token");
      const newSubtask = {
        title: newSubtasks[taskId].trim(),
        status: false,
      };

      try {
        const response = await fetch(`${server_url}/todo/${taskId}`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subtask: newSubtask }),
        });

        if (response.ok) {
          const data = await response.json();
          setTodos((prevTodos) =>
            prevTodos.map((todo) =>
              todo._id === taskId ? { ...todo, subtasks: data.todo.subtasks } : todo
            )
          );
          setNewSubtasks((prev) => ({ ...prev, [taskId]: "" }));
        }
      } catch (error) {
        console.error("Error adding subtask:", error);
      }
    }
  };

  const toggleTodo = async (taskId) => {
    try {
      const token = localStorage.getItem("token");
      const updatedTodos = todos.map((todo) => {
        if (todo._id === taskId) {
          return { ...todo, status: !todo.status };
        }
        return todo;
      });

      setTodos(updatedTodos);

      await fetch(`${server_url}/todo/${taskId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: !todos.find(t => t._id === taskId).status }),
      });
    } catch (error) {
      console.error("Error toggling todo:", error);
    }
  };

  const toggleSubtask = async (taskId, subtaskId) => {
    try {
      const token = localStorage.getItem("token");
      const updatedTodos = todos.map((todo) => {
        if (todo._id === taskId) {
          return {
            ...todo,
            subtasks: todo.subtasks.map((subtask) =>
              subtask._id === subtaskId ? { ...subtask, status: !subtask.status } : subtask
            ),
          };
        }
        return todo;
      });

      setTodos(updatedTodos);

      await fetch(`${server_url}/todo/${taskId}/subtasks/${subtaskId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: !todos
            .find((t) => t._id === taskId)
            .subtasks.find((s) => s._id === subtaskId).status,
        }),
      });
    } catch (error) {
      console.error("Error toggling subtask:", error);
    }
  };

  const removeTodo = async (taskId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${server_url}/todo/${taskId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setTodos(todos.filter(todo => todo._id !== taskId));
      }
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const removeSubtask = async (taskId, subtaskId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${server_url}/todo/${taskId}/subtasks/${subtaskId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setTodos((prevTodos) =>
          prevTodos.map((todo) =>
            todo._id === taskId
              ? { ...todo, subtasks: todo.subtasks.filter((s) => s._id !== subtaskId) }
              : todo
          )
        );
      }
    } catch (error) {
      console.error("Error removing subtask:", error);
    }
  };

  const toggleExpanded = (taskId) => {
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  // Timer utility functions
  const toggleTimer = () => {
    setIsRunning(prev => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    clearInterval(timerRef.current);
    const minutes = parseInt(editableMinutes, 10) || 25;
    const seconds = parseInt(editableSeconds, 10) || 0;
    setTimeLeft(minutes * 60 + seconds);
  };

  const handleTimeEdit = () => {
    if (isEditing) {
      const minutes = parseInt(editableMinutes, 10) || 0;
      const seconds = parseInt(editableSeconds, 10) || 0;
      setTimeLeft(minutes * 60 + seconds);
    }
    setIsEditing(!isEditing);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Previous imports and state management code remains the same...

  return (
    <div className="fixed inset-0 bg-black/80 text-white z-50 flex flex-col items-center backdrop-blur-sm">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors"
      >
        <X size={32} />
      </button>

      {/* Timer section */}
      <div className="text-center mt-20">
        {isEditing ? (
          <div className="flex items-center justify-center gap-2 mb-8">
            <input
              type="number"
              value={editableMinutes}
              onChange={(e) => setEditableMinutes(e.target.value)}
              className="w-24 text-3xl text-center border rounded p-2 bg-transparent text-white border-white"
              min="0"
              max="99"
            />
            <span className="text-3xl">:</span>
            <input
              type="number"
              value={editableSeconds}
              onChange={(e) => setEditableSeconds(e.target.value)}
              className="w-24 text-3xl text-center border rounded p-2 bg-transparent text-white border-white"
              min="0"
              max="59"
            />
          </div>
        ) : (
          <div className="text-8xl font-bold mb-8">
            {formatTime(timeLeft)}
          </div>
        )}

        <div className="flex justify-center gap-4 mb-12">
          <button 
            onClick={toggleTimer}
            disabled={isEditing}
            className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            {isRunning ? <Pause size={24} /> : <Play size={24} />}
            {isRunning ? "Pause" : "Start"}
          </button>
          
          <button 
            onClick={resetTimer}
            className="flex items-center gap-2 px-8 py-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <RotateCcw size={24} />
            Reset
          </button>
          
          <button 
            onClick={handleTimeEdit}
            className="flex items-center gap-2 px-8 py-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Edit2 size={24} />
            {isEditing ? "Save" : "Edit"}
          </button>
        </div>
      </div>

      {/* Todo list section */}
      <div className="w-96 bg-white/10 rounded-lg backdrop-blur-sm mx-auto">
        <div className="px-4 py-3 border-b border-white/20">
          <h3 className="font-medium text-white">To-do List</h3>
        </div>

        <div className="max-h-[calc(100vh-500px)] overflow-y-auto">
          {todos.map((todo) => (
            <div key={todo._id} className="border-b border-white/10 last:border-b-0">
              <div className="px-4 py-2 flex items-center gap-2 hover:bg-white/5">
                <input
                  type="checkbox"
                  checked={todo.status}
                  onChange={() => toggleTodo(todo._id)}
                  className="w-4 h-4 accent-white"
                />
                <button
                  onClick={() => toggleExpanded(todo._id)}
                  className="p-1 hover:bg-white/10 rounded"
                >
                  {expandedTasks[todo._id] ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                <span className={`flex-grow ${todo.status ? "line-through text-white/50" : ""}`}>
                  {todo.title}
                </span>
                <button
                  onClick={() => removeTodo(todo._id)}
                  className="text-white/40 hover:text-red-400 transition-colors"
                >
                  ×
                </button>
              </div>

              {expandedTasks[todo._id] && (
                <div className="pl-8 pr-4 pb-2 space-y-2">
                  {todo.subtasks.map((subtask) => (
                    <div key={subtask._id} className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        checked={subtask.status}
                        onChange={() => toggleSubtask(todo._id, subtask._id)}
                        className="w-4 h-4 accent-white"
                      />
                      <span className={`flex-grow ${subtask.status ? "line-through text-white/50" : ""}`}>
                        {subtask.title}
                      </span>
                      <button
                        onClick={() => removeSubtask(todo._id, subtask._id)}
                        className="text-white/40 hover:text-red-400 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={newSubtasks[todo._id] || ""}
                      onChange={(e) => handleSubtaskInputChange(todo._id, e.target.value)}
                      placeholder="Add subtask..."
                      className="flex-grow px-2 py-1 text-sm border border-white/20 rounded bg-transparent text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addSubtask(todo._id);
                        }
                      }}
                    />
                    <button
                      onClick={() => addSubtask(todo._id)}
                      className="p-1 hover:bg-white/10 rounded text-white"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={addTodo} className="p-4 border-t border-white/20">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add new task..."
            className="w-full px-3 py-2 border border-white/20 rounded bg-transparent text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
          />
        </form>
      </div>
    </div>
  );
};

export default FullscreenTimer;
