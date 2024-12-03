import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

function App() {
  const [tasks, setTasks] = useState({ todo: [], doing: [], done: [] });
  const [newTask, setNewTask] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [filter, setFilter] = useState('All');
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editTask, setEditTask] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const result = await axios.get('http://localhost:5000/tasks');
        setTasks({
          todo: result.data.todo || [],
          doing: result.data.doing || [],
          done: result.data.done || [],
        });
      } catch (err) {
        console.error(err);
        setError('Error fetching tasks');
      }
    };
    fetchTasks();
  }, []);

  useEffect(() => {
    const saveTasks = async () => {
      try {
        await axios.put('http://localhost:5000/tasks', tasks);
      } catch (err) {
        console.error(err);
        setError('');
      }
    };
    if (tasks) {
      saveTasks();
    }
  }, [tasks]);

  const addTask = (status) => {
    if (newTask.trim() !== '') {
      const task = {
        title: newTask,
        description: taskDesc,
        dueDate: dueDate,
        status: status,
        completed: false,
      };
      setTasks({ ...tasks, [status]: [...tasks[status], task] });
      setNewTask('');
      setTaskDesc('');
      setDueDate('');
    }
  };

  const removeTask = (status, index) => {
    const newTasks = tasks[status].filter((_, i) => i !== index);
    setTasks({ ...tasks, [status]: newTasks });
  };

  const moveTask = (from, to, index) => {
    const taskToMove = tasks[from][index];
    const newFromTasks = tasks[from].filter((_, i) => i !== index);
    const newToTasks = [...tasks[to], taskToMove];
    setTasks({ ...tasks, [from]: newFromTasks, [to]: newToTasks });
  };

  const markCompleted = (status, index) => {
    const taskToComplete = tasks[status][index];
    const newFromTasks = tasks[status].filter((_, i) => i !== index);
    const updatedTask = { ...taskToComplete, completed: true };
    setTasks({
      ...tasks,
      [status]: newFromTasks,
      done: [...tasks.done, updatedTask],
    });
  };

  const handleFilter = (filterType) => {
    setFilter(filterType);
  };

  const filteredTasks = () => {
    const allTasks = [...tasks.todo, ...tasks.doing, ...tasks.done];
    if (filter === 'Completed') {
      return allTasks.filter((task) => task.completed);
    } else if (filter === 'Pending') {
      return allTasks.filter((task) => !task.completed);
    } else if (filter === 'Overdue') {
      const today = new Date();
      return allTasks.filter((task) => {
        const taskDate = new Date(task.dueDate);
        return taskDate < today && !task.completed;
      });
    }
    return allTasks;
  };

  const startEditing = (status, index) => {
    const taskToEdit = tasks[status][index];
    setEditTask({ ...taskToEdit, status, index });
    setNewTask(taskToEdit.title);
    setTaskDesc(taskToEdit.description);
    setDueDate(taskToEdit.dueDate);
    setEditMode(true);
  };

  const saveEditedTask = () => {
    const updatedTasks = [...tasks[editTask.status]];
    updatedTasks[editTask.index] = {
      ...updatedTasks[editTask.index],
      title: newTask,
      description: taskDesc,
      dueDate: dueDate,
    };

    setTasks({
      ...tasks,
      [editTask.status]: updatedTasks,
    });
    setEditMode(false);
    setEditTask(null);
    setNewTask('');
    setTaskDesc('');
    setDueDate('');
  };

  const cancelEditingTask = () => {
    setEditMode(false);
    setEditTask(null);
    setNewTask('');
    setTaskDesc('');
    setDueDate('');
  };

  return (
    <div
      style={{
        backgroundColor: '#000000',
        color: '#ffffff',
        padding: '20px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '20px' }}>
        Task Management Dashboard
      </h1>
      {error && <div style={{ color: '#ff004f', marginBottom: '20px' }}>{error}</div>}

      {/* Filter Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {['All Tasks', 'Completed', 'Pending', 'Overdue'].map((status) => (
          <button
            key={status}
            style={{
              padding: '10px 20px',
              backgroundColor: filter === status ? '#ff004f' : '#333',
              color: '#ffffff',
              borderRadius: '30px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
            }}
            onClick={() => handleFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Tasks */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          marginTop: '20px',
        }}
      >
        {['todo', 'doing', 'done'].map((status) => (
          <div
            key={status}
            style={{
              backgroundColor: '#1a1a1a',
              color: '#ffffff',
              width: '30%',
              padding: '20px',
              margin: '10px',
              borderRadius: '10px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            }}
          >
            <h3>{status.toUpperCase()}</h3>
            {tasks[status] && tasks[status].length > 0 ? (
              tasks[status].map((task, index) => (
                <div key={index} style={{ marginBottom: '20px' }}>
                  <h4>{task.title}</h4>
                  <p>{task.description}</p>
                  <p style={{ fontStyle: 'italic' }}>Due: {task.dueDate}</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {status === 'todo' && (
                      <button
                        onClick={() => moveTask('todo', 'doing', index)}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#333',
                          color: 'white',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          transition: 'background-color 0.3s ease',
                        }}
                      >
                        Start
                      </button>
                    )}
                    {status === 'doing' && (
                      <button
                        onClick={() => markCompleted('doing', index)}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#333',
                          color: 'white',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          transition: 'background-color 0.3s ease',
                        }}
                      >
                        Mark as Completed
                      </button>
                    )}
                    <button
                      onClick={() => removeTask(status, index)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#333',
                        color: 'white',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease',
                      }}
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => startEditing(status, index)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#333',
                        color: 'white',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease',
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No tasks in this category</p>
            )}
          </div>
        ))}
      </div>

      {/* Add/Edit Task Form */}
      <div
        style={{
          marginTop: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Task Title"
          style={{
            padding: '10px',
            margin: '10px',
            width: '300px',
            borderRadius: '5px',
            border: '1px solid #ccc',
          }}
        />
        <textarea
          value={taskDesc}
          onChange={(e) => setTaskDesc(e.target.value)}
          placeholder="Task Description"
          style={{
            padding: '10px',
            margin: '10px',
            width: '300px',
            borderRadius: '5px',
            border: '1px solid #ccc',
          }}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          style={{
            padding: '10px',
            margin: '10px',
            width: '300px',
            borderRadius: '5px',
            border: '1px solid #ccc',
          }}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          {!editMode ? (
            <>
              <button
                onClick={() => addTask('todo')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ff004f',
                  color: 'white',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Add Task to To Do
              </button>
            </>
          ) : (
            <>
              <button
                onClick={saveEditedTask}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Save Task
              </button>
              <button
                onClick={cancelEditingTask}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
