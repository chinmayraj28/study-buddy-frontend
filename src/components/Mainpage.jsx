import { useState, useEffect, useRef } from "react"
import { CircleUser, Notebook, Timer, UserCog, LogOut, MessageCircleQuestion, CalendarDays } from "lucide-react"
import Dock from "./Dock"
import Squares from "./Squares"
import FullscreenTimer from "./FullscreenTimer"
import DraggableNoteWidget from "./DraggableNoteWidget"
import { X, ChevronRight, Plus, ChevronDown, Trash2, Calendar, Bell, User, Mail, Lock, CalendarIcon, Loader2 } from 'lucide-react';
import { useCallback, memo } from "react"
import React from "react"
import axios from 'axios'
import ReactMarkdown from "react-markdown";
import { jwtDecode } from "jwt-decode";
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const SettingsModal = ({ isOpen, onClose }) => {
  const { server_url } = require("../config/config.json");
  const [activeTab, setActiveTab] = useState("account");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setUsername(decoded.username);
      setEmail(decoded.email);
    }
  }, []);

  if (!isOpen) return null;

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${server_url}/update/update-user`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username, email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      localStorage.setItem("token", data.token);
      toast.success("User settings updated successfully!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${server_url}/update/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword: currentPassword, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      toast.success("Password updated successfully!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ fontFamily: "Poppins" }}>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Settings</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">×</button>
        </div>
        
        <div className="flex border-b">
          <button onClick={() => setActiveTab("account")} className={`px-4 py-2 ${activeTab === "account" ? "border-b-2 border-black text-black" : "text-gray-500"}`}>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Account</span>
            </div>
          </button>
          <button onClick={() => setActiveTab("privacy")} className={`px-4 py-2 ${activeTab === "privacy" ? "border-b-2 border-black text-black" : "text-gray-500"}`}>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Privacy</span>
            </div>
          </button>
        </div>

        <div className="p-4">
          {activeTab === "account" && (
            <form onSubmit={handleAccountSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4" />
                    <span>Username</span>
                  </div>
                </label>
                <input type="text" className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4" />
                    <span>Email Address</span>
                  </div>
                </label>
                <input type="email" className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="p-4 border-t flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors">Save Changes</button>
              </div>
            </form>
          )}

          {activeTab === "privacy" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4" />
                    <span>Change Password</span>
                  </div>
                </label>
                <div className="space-y-2">
                  <input type="password" className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black" placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                  <input type="password" className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  <input type="password" className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
              </div>
              <div className="p-4 border-t flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors">Save Changes</button>
              </div>
            </form>
          )}
        </div>
      </div>
            <ToastContainer position="top-center" autoClose={5000} hideProgressBar={false} closeOnClick pauseOnHover draggable theme="dark" transition={Bounce} />
    </div>
  );
};

const availableIcons = [
  {
    name: "Note",
    component: () => <Notebook color="#000000" />,
    description: "Take Notes",
  },
  {
    name: "Exam Scheduler",
    component: () => <CalendarDays color="#000000" />,
    description: "Exam Schedule",
  },
  {
    name: "Timer",
    component: () => <Timer color="#000000" />,
    description: "Focus Timer",
  },
]

const ProfileMenu = ({ onSettingsClick }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = React.useRef(null);


  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef} style={{fontFamily:"Poppins" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-gray-700 transition-colors"
      >
        <CircleUser color="#ffffff" />
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-56 bg-white rounded-lg shadow-lg py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-200 flex items-center gap-2">
            <CircleUser className="w-4 h-4" />
            <span className="font-medium">My Account</span>
          </div>

          <div className="py-1">
            <button 
              onClick={() => {
                onSettingsClick();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-100"
            >
              <UserCog className="w-4 h-4" />
              <span>Account Settings</span>
            </button>
          </div>

          <div className="border-t border-gray-200 mt-1">
            <button onClick={() => navigate('/logout')} className="w-full px-4 py-2 text-left flex items-center gap-2 text-red-600 hover:bg-gray-100">
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const TodoList = ({ todos, setTodos }) => {
  const [newTodo, setNewTodo] = useState("");
  const [newSubtasks, setNewSubtasks] = useState({});
  const [expandedTasks, setExpandedTasks] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const { server_url } = require("../config/config.json");
  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const token = localStorage.getItem("token"); 
        const response = await fetch(`${server_url}/todo`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setTodos(data);
      } catch (error) {
        console.error("Error fetching todos:", error);
      }
    };
  
    fetchTodos();
  }, []);
  

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
        setTodos([...todos, result.todo]); // Update the UI
        setNewTodo("");
      }
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const addSubtask = async (taskId) => {
    const token = localStorage.getItem("token");
  
    if (newSubtasks[taskId]?.trim()) {
      const newSubtask = {
        title: newSubtasks[taskId].trim(),
        status: false,
      };

      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo._id === taskId
            ? { ...todo, subtasks: [...todo.subtasks, newSubtask] }
            : todo
        )
      );
  
      setNewSubtasks((prev) => ({ ...prev, [taskId]: "" })); // Clear input
  
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
        } else {
          console.error("Failed to add subtask");
        }
      } catch (error) {
        console.error("Error adding subtask:", error);
      }
    }
  };
  

  const toggleTodo = async (taskId, subtaskId = null) => {
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

  const toggleExpanded = (taskId) => {
    setExpandedTasks(prev => {
      const isExpanded = !prev[taskId];
      setActiveTaskId(isExpanded ? taskId : null);
      return { ...prev, [taskId]: isExpanded };
    });
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

  return (
    <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-lg" style={{fontFamily:"Poppins" }}>
      <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
        <h3 className="font-medium">To-do List</h3>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {todos.map((todo) => (
          <div key={todo._id} className="border-b border-gray-100 last:border-b-0">
            <div className="px-4 py-2 flex items-center gap-2 hover:bg-gray-50">
              <input
                type="checkbox"
                checked={todo.status}
                onChange={() => toggleTodo(todo._id)}
                className="w-4 h-4 accent-black"
              />
              <button
                onClick={() => toggleExpanded(todo._id)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {expandedTasks[todo._id] ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              <span className={`flex-grow ${todo.status ? "line-through text-gray-500" : ""}`}>
                {todo.title}
              </span>
              <button
                onClick={() => removeTodo(todo._id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
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
                      className="w-4 h-4 accent-black"
                    />
                    <span className={`flex-grow ${subtask.status ? "line-through text-gray-500" : ""}`}>
                      {subtask.title}
                    </span>
                    <button
                      onClick={() => removeSubtask(todo._id, subtask._id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
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
                  className="flex-grow px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addSubtask(todo._id);
                    }
                  }}
                />

                  <button
                    onClick={() => addSubtask(todo._id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={addTodo} className="p-4 border-t border-gray-200">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add new task..."
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
        />
      </form>
    </div>
  );
};


const ChatWindow = ({ onClose }) => {
  const [messages, setMessages] = useState(() => {
    const savedMessages = sessionStorage.getItem("chatMessages");
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [inputMessage, setInputMessage] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem("chatMessages", JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isBotTyping) {
      inputRef.current?.focus();
    }
  }, [isBotTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isBotTyping) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      isBot: false,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsBotTyping(true);

    try {
      const { server_url } = require("../config/config.json");
      const response = await fetch(`${server_url}/aichat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ question: inputMessage }),
      });

      if (!response.ok) throw new Error("Failed to fetch response from AI");
      
      const data = await response.json();
      streamBotResponse(data.response);
    } catch (error) {
      console.error("Error sending message:", error);
      setIsBotTyping(false);
    }
  };

  const streamBotResponse = async (fullText) => {
    let currentText = "";
    for (let i = 0; i < fullText.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 20));
      currentText += fullText[i];
      setMessages((prev) => {
        const updatedMessages = [...prev];
        if (updatedMessages.length === 0 || !updatedMessages[updatedMessages.length - 1].isBot) {
          updatedMessages.push({ id: Date.now(), text: "", isBot: true });
        }
        updatedMessages[updatedMessages.length - 1].text = currentText;
        return [...updatedMessages];
      });
    }
    setIsBotTyping(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-300">
          <h2 className="text-xl font-semibold text-gray-900">🧠 StudyBuddy</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-b-2xl">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
            >
              <div 
                className={`max-w-[75%] px-4 py-2 rounded-xl shadow-md ${
                  message.isBot 
                    ? "bg-white text-gray-900 border border-gray-200" 
                    : "bg-black text-white"
                }`}
              >
                <ReactMarkdown>{message.text}</ReactMarkdown>
              </div>
            </div>
          ))}
          
          {isBotTyping && (
            <div className="flex justify-start">
              <div className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 italic shadow-sm">
                StudyBuddy is typing...
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="border-t border-gray-300 p-4 bg-white">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask StudyBuddy anything..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              disabled={isBotTyping}
              ref={inputRef}
            />
            <button 
              type="submit" 
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
              disabled={isBotTyping}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ExamPlanner = ({ onClose }) => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const { server_url } = require("../config/config.json");
  
  const [newExam, setNewExam] = useState({
    scheduleName: '',
    availableStudyHours: 2,
    maxContinuousStudyTime: 90,
    maxSubjectsPerDay: 2
  });
  
  const [tempSubjects, setTempSubjects] = useState([{
    id: Date.now(),
    subject: '',
    examDate: '',
    confidenceLevel: 5
  }]);

  useEffect(() => {
    fetchExamSchedules();
  }, []);

  const fetchExamSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await fetch(`${server_url}/planner`, {
        method: "GET",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`,},
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch exam schedules');
      }

      const data = await response.json();
      setExams(data.schedules);
    } catch (err) { 
      toast.error('Failed to load exam schedules. Please try again later.');
      console.error('Error fetching exam schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!newExam.scheduleName.trim()) {
      toast.error('Schedule name is required');
      return false;
    }

    if (tempSubjects.length < 2) {
      toast.error('At least 2 subjects are required');
      return false;
    }

    for (let i = 0; i < tempSubjects.length; i++) {
      const subject = tempSubjects[i];
      if (!subject.subject.trim()) {
        toast.error(`Subject name is required for Subject ${i + 1}`);
        return false;
      }
      if (!subject.examDate) {
        toast.error(`Exam date is required for Subject ${i + 1}`);
        return false;
      }

      const examDate = new Date(subject.examDate);
      const tomorrow = new Date(getTomorrowDate());
      if (examDate < tomorrow) {
        toast.error(`Exam date for Subject ${i + 1} must be at least a day away`);
        return false;
      }
    }

    return true;
  };

  const handleExamInputChange = (field, value) => {
    setNewExam({
      ...newExam,
      [field]: value
    });
    setError(null);
  };

  const handleSubjectInputChange = (index, field, value) => {
    const updatedSubjects = [...tempSubjects];
    updatedSubjects[index] = {
      ...updatedSubjects[index],
      [field]: value
    };
    setTempSubjects(updatedSubjects);
    setError(null); 
  };

  const addNewSubjectField = () => {
    setTempSubjects([...tempSubjects, {
      id: Date.now(),
      subject: '',
      examDate: '',
      confidenceLevel: 5
    }]);
    setError(null);
  };

  const removeSubjectField = (indexToRemove) => {
    if (tempSubjects.length <= 2) {
      toast.error('At least 2 subjects are required');
      return;
    }
    setTempSubjects(tempSubjects.filter((_, index) => index !== indexToRemove));
  };

  const resetForm = () => {
    setNewExam({
      scheduleName: '',
      availableStudyHours: 2,
      maxContinuousStudyTime: 90,
      maxSubjectsPerDay: 2
    });
    setTempSubjects([{
      id: Date.now(),
      subject: '',
      examDate: '',
      confidenceLevel: 5
    }]);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();    
    if (!validateForm()) {
      return;
    }

    console.log('Submitting form:', newExam, tempSubjects);
    const formattedData = {
      scheduleName: newExam.scheduleName,
      subjects: tempSubjects.map(subject => {
        const date = new Date(subject.examDate);
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${date.getFullYear()}`;
    
        return {
          subject: subject.subject,
          examDate: formattedDate, 
          confidenceLevel: subject.confidenceLevel
        };
      }),
      availableStudyHours: newExam.availableStudyHours,
      maxContinuousStudyTime: newExam.maxContinuousStudyTime,
      maxSubjectsPerDay: newExam.maxSubjectsPerDay
    };
    
    

    const token = localStorage.getItem('token');

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${server_url}/planner`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`,},
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        throw new Error('Failed to upload exam schedule');
      }

      const result = await response.json();
      setExams([...exams, result.schedule]);
      resetForm();
      toast.success('Exam schedule created successfully!');
    } catch (err) {
      toast.error('Failed to create exam schedule. Please try again.');
      console.error('Error uploading exam schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };
  const handleScheduleClick = (schedule) => {
    setSelectedSchedule(schedule);
    setShowCalendar(true);
  };

  const removeExamSchedule = async (examId) => {
    try {
      const response = await fetch(`${server_url}/planner/${examId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ examId })
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete schedule');
      }

      const updatedExams = exams.filter(exam => exam._id !== examId);
      setExams(updatedExams);
      toast.success('Schedule deleted successfully');
    } catch (error) {
      toast.error('Error deleting schedule');
      console.error('Error deleting schedule:', error);
    }
  };
  
  

  const getTasksForSelectedDate = (date) => {
    if (!selectedSchedule?.schedule || typeof selectedSchedule.schedule !== 'object' || !date) return [];
    
    const dateStr = date.toLocaleDateString('en-CA'); // Ensures YYYY-MM-DD format in local time
    
    return selectedSchedule.schedule[dateStr] || [];
  };
  

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col">
      <div className="flex justify-between items-center p-4 border-b bg-white">
        <h1 className="text-2xl font-bold">Exam Planner</h1>
        <button 
          onClick={onClose} 
          className="p-2 hover:bg-gray-100 rounded-full"
          disabled={loading}
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          {error}
        </div>
      )}

      <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
        <div className="border-r flex flex-col h-full overflow-hidden">
          <div className="p-6 pb-4 bg-white">
            <h2 className="text-xl font-bold">Create New Exam Schedule</h2>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="p-4 border rounded-lg space-y-4 bg-white">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Schedule Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newExam.scheduleName}
                    onChange={(e) => handleExamInputChange('scheduleName', e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-black focus:border-transparent"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="p-4 border rounded-lg space-y-4 bg-white">
                <h3 className="font-medium">Study Plan Settings</h3>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Hours available for study per day: {newExam.availableStudyHours}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="24"
                    value={newExam.availableStudyHours}
                    onChange={(e) => handleExamInputChange('availableStudyHours', parseInt(e.target.value))}
                    className="w-full accent-black"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Max continuous study time (minutes): {newExam.maxContinuousStudyTime}
                  </label>
                  <input
                    type="range"
                    min="15"
                    max="360"
                    step="15"
                    value={newExam.maxContinuousStudyTime}
                    onChange={(e) => handleExamInputChange('maxContinuousStudyTime', parseInt(e.target.value))}
                    className="w-full accent-black"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Max subjects per day: {newExam.maxSubjectsPerDay}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={newExam.maxSubjectsPerDay}
                    onChange={(e) => handleExamInputChange('maxSubjectsPerDay', parseInt(e.target.value))}
                    className="w-full accent-black"
                    disabled={loading}
                  />
                </div>
              </div>

              {tempSubjects.map((subject, index) => (
                <div key={subject.id} className="p-4 border rounded-lg space-y-4 bg-white">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Subject {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeSubjectField(index)}
                      className="text-red-500 hover:text-red-700"
                      disabled={loading || tempSubjects.length <= 2}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Subject Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={subject.subject}
                      onChange={(e) => handleSubjectInputChange(index, 'subject', e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Exam Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={subject.examDate}
                      min={getTomorrowDate()}
                      onChange={(e) => handleSubjectInputChange(index, 'examDate', e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Current Confidence Level (1-10): {subject.confidenceLevel}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={subject.confidenceLevel}
                      onChange={(e) => handleSubjectInputChange(index, 'confidenceLevel', parseInt(e.target.value))}
                      className="w-full accent-black"
                      disabled={loading}
                    />
                  </div>
                </div>
              ))}
            </form>
          </div>
          <div className="p-6 border-t bg-white mt-auto">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={addNewSubjectField}
                className="flex items-center gap-2 px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                disabled={loading}
              >
                <Plus className="w-4 h-4" />
                Add Another Subject
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Creating...' : 'Create Exam Plan'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col h-full overflow-hidden">
          <div className="p-6 pb-4 bg-white">
            <h2 className="text-xl font-bold">Existing Schedules</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {loading && exams.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : exams.length > 0 ? (
              <div className="space-y-4">
                {exams.map((exam) => (
                  <div 
                  key={exam._id} 
                  id={exam._id} 
                  className="p-4 border rounded-lg bg-white cursor-pointer hover:bg-gray-50 relative"
                  onClick={() => handleScheduleClick(exam)}
                >
                  <button
                      type="button"
                      className="text-red-500 hover:text-red-700 absolute top-4 right-4"
                      onClick={(e) => {
                        e.stopPropagation(); 
                        removeExamSchedule(exam._id);
                      }}
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  <h3 className="font-bold pr-8">{exam.scheduleName}</h3>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Study Hours: {exam.availableStudyHours} hours/day</p>
                    <p>Subjects: {exam.subjects.length}</p>
                  </div>
                </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                No exam schedules found
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={showCalendar} onClose={() => setShowCalendar(false)}>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">
            {selectedSchedule?.scheduleName} - Schedule Calendar
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <ExamCalendar
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                examSchedule={selectedSchedule}
              />
            </div>
            <div>
              <h3 className="font-medium mb-4">
                {selectedDate ? (
                  `Tasks for ${selectedDate.toLocaleDateString()}`
                ) : (
                  'Select a date to view tasks'
                )}
              </h3>
              <div className="overflow-y-auto max-h-64 pr-2">
                {selectedDate && getTasksForSelectedDate(selectedDate).map((task, index) => (
                  <div key={index} className="p-3 border rounded-lg mb-2">
                    <h4 className="font-medium">{task.subject}</h4>
                    <div className="mt-1 text-sm text-gray-600">
                      <p>Study Time: {task.minutes} minutes</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <ToastContainer 
        position="top-center" 
        autoClose={5000} 
        hideProgressBar={false} 
        closeOnClick 
        pauseOnHover 
        draggable 
        theme="dark" 
        transition={Bounce} 
      />
    </div>
  );
}

const ExamCalendar = ({ selectedDate, onSelectDate, examSchedule }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [subjectColors, setSubjectColors] = useState({});

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Generate a random color
  const generateRandomColor = () => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500',
      'bg-teal-500', 'bg-cyan-500', 'bg-rose-500', 'bg-violet-500'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Initialize colors for subjects when schedule changes
  useEffect(() => {
    if (examSchedule?.subjects) {
      const newSubjectColors = {};
      const usedColors = new Set();

      examSchedule.subjects.forEach(({ subject }) => {
        if (!subjectColors[subject]) {
          let color;
          do {
            color = generateRandomColor();
          } while (usedColors.has(color));
          
          usedColors.add(color);
          newSubjectColors[subject] = color;
        }
      });

      setSubjectColors(prev => ({ ...prev, ...newSubjectColors }));
    }
  }, [examSchedule?.subjects]);

  const getTasksForDate = (date) => {
    if (!examSchedule?.schedule || typeof examSchedule.schedule !== 'object') return [];
    
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    return examSchedule.schedule[dateStr] || [];
  };

  const isSelected = (date) => {
    return selectedDate &&
      selectedDate.getDate() === date &&
      selectedDate.getMonth() === currentDate.getMonth() &&
      selectedDate.getFullYear() === currentDate.getFullYear();
  };

  const isToday = (date) => {
    const today = new Date();
    return today.getDate() === date &&
           today.getMonth() === currentDate.getMonth() &&
           today.getFullYear() === currentDate.getFullYear();
  };

  const changeMonth = (increment) => {
    setCurrentDate(new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + increment,
      1
    ));
  };

  const handleDateClick = (date) => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      date
    );
    onSelectDate(newDate);
  };

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={() => changeMonth(-1)}
          className="p-2 hover:bg-gray-100 rounded"
        >
          ←
        </button>
        <h3 className="font-bold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button 
          onClick={() => changeMonth(1)}
          className="p-2 hover:bg-gray-100 rounded"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium p-2">
            {day}
          </div>
        ))}
        
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="p-2"></div>
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const date = index + 1;
          const tasksForDate = getTasksForDate(date);
          const isDateSelected = isSelected(date);
          const isDateToday = isToday(date);
          const isPastDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            date
          ) < new Date(new Date().setHours(0, 0, 0, 0));

          return (
            <div key={date} className="relative">
              <button
                onClick={() => handleDateClick(date)}
                className={`w-full p-2 rounded text-center relative ${
                  isDateSelected ? 'bg-black text-white' :
                  isDateToday ? 'border-2 border-black' :
                  isPastDate ? 'text-gray-300' :
                  'hover:bg-gray-100'
                }`}
              >
                {date}
                {tasksForDate.length > 0 && (
                  <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1">
                    {tasksForDate.map((task, i) => (
                      <div 
                        key={i}
                        className={`w-1 h-1 rounded-full ${subjectColors[task.subject] || 'bg-gray-500'}`}
                        title={`${task.subject}: ${task.minutes} minutes`}
                      />
                    ))}
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      {Object.keys(subjectColors).length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          {Object.entries(subjectColors).map(([subject, color]) => (
            <div key={subject} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${color}`} />
              <span>{subject}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex justify-end p-2">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

  const Circle = memo(({ circle, icon: IconComponent, description, onClick, setDragging, setJustDragged }) => {
    const [position, setPosition] = useState({
      x: circle.x,
      y: circle.y,
    });
    const dragRef = useRef({
      isDragging: false,
      mouseMoved: false   
    });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseDown = useCallback((e) => {
      e.preventDefault();
      dragRef.current = {
        isDragging: true,
        mouseMoved: false
      };
      setDragging(true);

      const handleMouseMove = (e) => {
        if (!dragRef.current.isDragging) return;
        
        dragRef.current.mouseMoved = true;
        
        // Direct cursor following without any calculations that could cause delay
        const newX = e.clientX - 40;
        const newY = e.clientY - 40;
        
        // Simple boundary checking
        const maxX = window.innerWidth - 80;
        const maxY = window.innerHeight - 72 - 80;
        
        setPosition({ 
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY))
        });
      };

      const handleMouseUp = () => {
        if (dragRef.current.isDragging) {
          dragRef.current.isDragging = false;
          setDragging(false);
          if (dragRef.current.mouseMoved) {
            setJustDragged(true);
          }
        }
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }, [setDragging, setJustDragged]);

    const handleClick = useCallback(() => {
      if (!dragRef.current.mouseMoved) {
        onClick(circle);
      }
    }, [circle, onClick]);

    return (
      <div
        className={`absolute w-20 h-20 bg-white rounded-full cursor-grab flex items-center justify-center ${
          dragRef.current.isDragging ? "cursor-grabbing shadow-lg" : ""
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: isHovered ? 'scale(1.5)' : 'scale(1)',
          // Remove transition effects for instant movement
          willChange: 'transform, left, top',
          touchAction: 'none',
          userSelect: 'none'
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {IconComponent && <IconComponent />}
        {isHovered && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded whitespace-nowrap">
            {description}
          </div>
        )}
      </div>
    );
  });

  const dockHeight = 72

  const NoteTabs = ({ activeTab, setActiveTab }) => {
    
    return (
      <div className="flex mb-4 backdrop-opacity-80">
        <button
          className={`px-4 py-2 ${activeTab === 'write' ? 'border-b-2 border-black text-white' : 'text-gray-500'}`}
          onClick={() => setActiveTab('write')}
        >
          Write Note
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'saved' ? 'border-b-2 border-black text-white' : 'text-gray-500'}`}
          onClick={() => setActiveTab('saved')}
        >
          Saved Notes
        </button>
      </div>
    )
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

const SavedNotesList = ({ notes, onNoteClick, onDeleteNote, fetchNotes }) => {
  useEffect(() => {
    fetchNotes(); // Fetch fresh notes when the component mounts
  }, []);

  return (
    <div className="space-y-3">
      {notes.length === 0 ? (
        <p className="text-gray-500">No saved notes yet</p>
      ) : (
        notes.map((note) => (
          <div
            key={note._id}
            className="p-3 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onNoteClick(note)}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="text-sm text-gray-500">{formatDate(note.createdAt)}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNote(note._id);
                }}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
            <p className="line-clamp-1 text-white">{note.content}</p>
          </div>
        ))
      )}
    </div>
  );
};

const FloatingCircles = () => {
  const [loading, setLoading] = useState(false);
  const [circles, setCircles] = useState([])
  const [activeWindow, setActiveWindow] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [justDragged, setJustDragged] = useState(false)
  const [showExamPlanner, setShowExamPlanner] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [todos, setTodos] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  
  // Note-related state
  const [notes, setNotes] = useState([])
  const [activeNotes, setActiveNotes] = useState([])
  const [activeTab, setActiveTab] = useState('write')
  const [currentNote, setCurrentNote] = useState("")
  const { server_url } = require('../config/config.json')

  const fetchNotes = async () => {
    try {
      const response = await fetch(`${server_url}/stickynotes`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch notes");

      const data = await response.json();
      setNotes(data.stickyNotes || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleNoteSave = async () => {
    if (!currentNote.trim()) return;

    const newNote = {
      content: currentNote,
      createdAt: new Date().toLocaleString(),
    };

    const tempId = Date.now().toString();
    const optimisticNote = { ...newNote, _id: tempId };
    setNotes([optimisticNote, ...notes]);
    setCurrentNote("");

    try {
      const response = await fetch(`${server_url}/stickynotes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newNote),
      });

      if (!response.ok) throw new Error("Failed to save note");

      const savedNote = await response.json();
      setNotes((prevNotes) => prevNotes.map((note) => (note._id === tempId ? savedNote : note)));
    } catch (error) {
      console.error("Error saving note:", error);
      setNotes((prevNotes) => prevNotes.filter((note) => note._id !== tempId));
    }
  };

const handleDeleteNote = async (id) => {
    const previousNotes = notes;
    setNotes(notes.filter((note) => note._id !== id));
    setActiveNotes(activeNotes.filter((note) => note._id !== id));

    try {
      const response = await fetch(`${server_url}/stickynotes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to delete note");
    } catch (error) {
      console.error("Error deleting note:", error);
      setNotes(previousNotes); 
    }
  };


  useEffect(() => {
    const todoWidgetWidth = 320
    const todoWidgetRight = 16
    const todoWidgetTop = 16

    const newCircles = availableIcons.map((icon) => {
      let x, y;
      let validPosition = false;

      while (!validPosition) {
        x = Math.random() * (window.innerWidth - 80)
        y = Math.random() * (window.innerHeight - dockHeight - 128)
        
        const circleRight = x + 80
        const circleBottom = y + 80
        const todoWidgetLeft = window.innerWidth - todoWidgetWidth - todoWidgetRight

        validPosition = !(
          circleRight > todoWidgetLeft &&
          x < window.innerWidth - todoWidgetRight &&
          circleBottom > todoWidgetTop &&
          y < todoWidgetTop + 500
        )
      }

      return {
        id: Math.random(),
        x,
        y,
        icon: icon.name,
        description: icon.description,
      }
    })
    setCircles(newCircles)
  }, [])

  const handleCircleClick = (circle) => {
    if (!justDragged) {
      setActiveWindow(circle.icon)
    }
    setJustDragged(false)
  }

  const closeWindow = () => {
    setActiveWindow(null)
  }

  const renderCircleWindow = () => {
    if (!activeWindow) return null;
  
    // Render FullscreenTimer directly without the white container
    if (activeWindow === "Timer") {
      return <FullscreenTimer onClose={closeWindow} todos={todos} setTodos={setTodos} />;
    }
    if(activeWindow === "Exam Scheduler"){
      return <ExamPlanner onClose={closeWindow}/>
    }
  
    // For other windows, keep the existing white container
    return (
      <div className="fixed inset-1  bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-40">
        <div className="bg-white/10 p-8 rounded-lg shadow-lg w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">{activeWindow}</h2>
            <button onClick={closeWindow} className="text-white hover:text-gray-700 text-2xl">
              ×
            </button>
          </div>
          {activeWindow === "Note" ? (
            <div className="space-y-4 ">
              <NoteTabs activeTab={activeTab} setActiveTab={setActiveTab} className="bg-black" />
              
              {activeTab === 'write' ? (
                <div>
                  <textarea
                    className="w-full h-64 p-2 border border-black rounded resize-none focus:ring-2 focus:border-transparent bg-white/10 text-white"
                    placeholder="Start taking notes..."
                    value={currentNote}
                    onChange={(e) => setCurrentNote(e.target.value)}
                  ></textarea>
                  {currentNote.trim() && (
                    <button
                      onClick={handleNoteSave}
                      className="mt-2 px-4 py-2 bg-black text-white rounded hover:bg-gray-900 transition-colors"
                    >
                      Save Note
                    </button>
                  )}
                </div>
              ) : (
                <SavedNotesList
                  notes={notes}
                  onNoteClick={(note) => {
                    if (!activeNotes.find(n => n._id === note._id)) {
                      setActiveNotes(notes => [...notes, note]);
                    }
                    closeWindow();
                  }}
                  onDeleteNote={handleDeleteNote}
                  fetchNotes={fetchNotes} 
                />
              )}
            </div>
          ) : null}
        </div>
      </div>
    );
  };
  
  const items = [
    { icon: <MessageCircleQuestion color="#ffffff"/>, label: "Help", onClick: () => setIsChatOpen(true) },
    { icon: <CalendarDays color="#ffffff"/>, label: "Exam scheduler", onClick: () => setShowExamPlanner(true) },
    { icon: <ProfileMenu onSettingsClick={() => setIsSettingsOpen(true)} />, label: "Profile" }
  ];

  return (
    <div className="h-screen w-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0">
        <Squares speed={0.2} borderColor="#262626" />
      </div>
      <TodoList todos={todos} setTodos={setTodos} />
      {activeNotes.map((note) => (
        <DraggableNoteWidget
          key={note._id}
          note={note}
          onClose={() => setActiveNotes(notes => notes.filter(n => n._id !== note._id))}
          onDelete={() => handleDeleteNote(note._id)}
        />
      ))}
      {circles.map((circle) => (
        <Circle
          key={circle.id}
          circle={circle}
          icon={availableIcons.find((i) => i.name === circle.icon)?.component || (() => null)}
          description={circle.description}
          onClick={handleCircleClick}
          setDragging={setDragging}
          setJustDragged={setJustDragged}
        />
      ))}
      {renderCircleWindow()}
      {showExamPlanner && <ExamPlanner onClose={() => setShowExamPlanner(false)} />}
      {isChatOpen && <ChatWindow onClose={() => setIsChatOpen(false)} />}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
      <Dock items={items} panelHeight={dockHeight} baseItemSize={50} magnification={70} className="absolute bottom-5" />
    </div>
  )
}

export default FloatingCircles;