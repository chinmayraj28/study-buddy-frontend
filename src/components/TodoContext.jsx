import { createContext, useState, useContext, useEffect } from "react"

const TodoContext = createContext()

export const useTodoContext = () => useContext(TodoContext)

export const TodoProvider = ({ children }) => {
  const [todos, setTodos] = useState([])
  const { server_url } = require("./config/config.json")

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`${server_url}/todo`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        const data = await response.json()
        setTodos(data)
      } catch (error) {
        console.error("Error fetching todos:", error)
      }
    }

    fetchTodos()
  }, [server_url])

  const addTodo = async (newTodo) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${server_url}/todo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTodo.trim(),
        }),
      })

      const result = await response.json()
      if (response.ok) {
        setTodos([...todos, result.todo])
      }
    } catch (error) {
      console.error("Error adding todo:", error)
    }
  }

  const toggleTodo = async (taskId) => {
    try {
      const token = localStorage.getItem("token")
      const updatedTodos = todos.map((todo) => {
        if (todo._id === taskId) {
          return { ...todo, status: !todo.status }
        }
        return todo
      })

      setTodos(updatedTodos)

      await fetch(`${server_url}/todo/${taskId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: !todos.find((t) => t._id === taskId).status }),
      })
    } catch (error) {
      console.error("Error toggling todo:", error)
    }
  }

  const removeTodo = async (taskId) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${server_url}/todo/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setTodos(todos.filter((todo) => todo._id !== taskId))
      }
    } catch (error) {
      console.error("Error deleting todo:", error)
    }
  }

  const addSubtask = async (taskId, newSubtask) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${server_url}/todo/${taskId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subtask: newSubtask }),
      })

      if (response.ok) {
        const data = await response.json()
        setTodos((prevTodos) =>
          prevTodos.map((todo) => (todo._id === taskId ? { ...todo, subtasks: data.todo.subtasks } : todo)),
        )
      } else {
        console.error("Failed to add subtask")
      }
    } catch (error) {
      console.error("Error adding subtask:", error)
    }
  }

  const toggleSubtask = async (taskId, subtaskId) => {
    try {
      const token = localStorage.getItem("token")
      const updatedTodos = todos.map((todo) => {
        if (todo._id === taskId) {
          return {
            ...todo,
            subtasks: todo.subtasks.map((subtask) =>
              subtask._id === subtaskId ? { ...subtask, status: !subtask.status } : subtask,
            ),
          }
        }
        return todo
      })

      setTodos(updatedTodos)

      await fetch(`${server_url}/todo/${taskId}/subtasks/${subtaskId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: !todos.find((t) => t._id === taskId).subtasks.find((s) => s._id === subtaskId).status,
        }),
      })
    } catch (error) {
      console.error("Error toggling subtask:", error)
    }
  }

  const removeSubtask = async (taskId, subtaskId) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${server_url}/todo/${taskId}/subtasks/${subtaskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setTodos((prevTodos) =>
          prevTodos.map((todo) =>
            todo._id === taskId ? { ...todo, subtasks: todo.subtasks.filter((s) => s._id !== subtaskId) } : todo,
          ),
        )
      }
    } catch (error) {
      console.error("Error removing subtask:", error)
    }
  }

  return (
    <TodoContext.Provider
      value={{
        todos,
        addTodo,
        toggleTodo,
        removeTodo,
        addSubtask,
        toggleSubtask,
        removeSubtask,
      }}
    >
      {children}
    </TodoContext.Provider>
  )
}

