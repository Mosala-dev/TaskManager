import { useEffect, useMemo, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { api } from './api'

const STATUS = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE'
}

const STATUS_LABELS = {
  TODO: 'Todo',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done'
}

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('taskmanager_user')) || null
    } catch {
      return null
    }
  })

  const [page, setPage] = useState('login')

  useEffect(() => {
    if (user) setPage('dashboard')
  }, [user])

  function handleAuthSuccess(data) {
    localStorage.setItem('taskmanager_token', data.token)
    const currentUser = {
      id: data.id,
      name: data.name,
      email: data.email
    }
    localStorage.setItem('taskmanager_user', JSON.stringify(currentUser))
    setUser(currentUser)
    setPage('dashboard')
  }

  function logout() {
    localStorage.removeItem('taskmanager_token')
    localStorage.removeItem('taskmanager_user')
    setUser(null)
    setPage('login')
  }

  if (!user) {
    return (
      <>
        {page === 'register' ? (
          <RegisterPage onLogin={() => setPage('login')} onSuccess={handleAuthSuccess} />
        ) : (
          <LoginPage onRegister={() => setPage('register')} onSuccess={handleAuthSuccess} />
        )}
        <Analytics />
      </>
    )
  }

  return (
    <>
      <Dashboard user={user} onLogout={logout} />
      <Analytics />
    </>
  )
}

function LoginPage({ onRegister, onSuccess }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await api.login(form)
      onSuccess(data)
    } catch (err) {
      setError(err.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your tasks."
      footer={
        <>
          Don't have an account?{' '}
          <button className="link-button" onClick={onRegister}>Create one</button>
        </>
      }
    >
      <form onSubmit={submit} className="auth-form">
        <Field
          label="Email"
          type="email"
          value={form.email}
          placeholder="you@example.com"
          onChange={(value) => setForm({ ...form, email: value })}
          required
        />
        <Field
          label="Password"
          type="password"
          value={form.password}
          placeholder="••••••••"
          onChange={(value) => setForm({ ...form, password: value })}
          required
        />
        {error && <Alert type="error">{error}</Alert>}
        <button className="primary-button full-width" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  )
}

function RegisterPage({ onLogin, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function submit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (form.password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      await api.register(form)
      setSuccess('Registration successful. You can now sign in.')
      setForm({ name: '', email: '', password: '' })
      setConfirmPassword('')
    } catch (err) {
      setError(err.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start organizing your work today."
      footer={
        <>
          Already have an account?{' '}
          <button className="link-button" onClick={onLogin}>Sign in</button>
        </>
      }
    >
      <form onSubmit={submit} className="auth-form">
        <Field
          label="Full name"
          value={form.name}
          placeholder="John Doe"
          onChange={(value) => setForm({ ...form, name: value })}
          required
        />
        <Field
          label="Email"
          type="email"
          value={form.email}
          placeholder="john@example.com"
          onChange={(value) => setForm({ ...form, email: value })}
          required
        />
        <Field
          label="Password"
          type="password"
          value={form.password}
          placeholder="At least 6 characters"
          onChange={(value) => setForm({ ...form, password: value })}
          minLength={6}
          required
        />
        <Field
          label="Confirm password"
          type="password"
          value={confirmPassword}
          placeholder="Repeat your password"
          onChange={setConfirmPassword}
          minLength={6}
          required
        />
        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}
        <button className="primary-button full-width" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  )
}

function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <div className="brand-mark">✓</div>
        <div>
          <p className="eyebrow">EncoderX • Full Stack Development</p>
          <h1>Task Manager</h1>
          <p>Plan your work, track progress, and finish what matters.</p>
        </div>
        <div className="feature-list">
          <span>✓ Secure JWT authentication</span>
          <span>✓ Personal task management</span>
          <span>✓ Todo, In Progress & Done</span>
        </div>
      </section>

      <section className="auth-card-wrap">
        <div className="auth-card">
          <div className="auth-heading">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          {children}
          <div className="auth-footer">{footer}</div>
        </div>
      </section>
    </main>
  )
}

function Dashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [modal, setModal] = useState(null)

  async function loadTasks() {
    setLoading(true)
    setError('')
    try {
      const data = await api.getTasks()
      setTasks(Array.isArray(data) ? data : [])
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        onLogout()
        return
      }
      setError(err.message || 'Could not load tasks.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  async function saveTask(form) {
    try {
      if (modal?.mode === 'edit') {
        const updated = await api.updateTask(modal.task.id, form)
        setTasks((current) =>
          current.map((task) => task.id === updated.id ? updated : task)
        )
        setNotice('Task updated successfully.')
      } else {
        const created = await api.createTask(form)
        setTasks((current) => [created, ...current])
        setNotice('Task created successfully.')
      }
      setModal(null)
      clearNoticeSoon()
    } catch (err) {
      throw err
    }
  }

  async function deleteTask(task) {
    const confirmed = window.confirm(`Delete "${task.title}"?`)
    if (!confirmed) return

    try {
      await api.deleteTask(task.id)
      setTasks((current) => current.filter((item) => item.id !== task.id))
      setNotice('Task deleted successfully.')
      clearNoticeSoon()
    } catch (err) {
      setError(err.message || 'Could not delete task.')
    }
  }

  function clearNoticeSoon() {
    setTimeout(() => setNotice(''), 2500)
  }

  const grouped = useMemo(() => ({
    TODO: tasks.filter((task) => task.status === STATUS.TODO),
    IN_PROGRESS: tasks.filter((task) => task.status === STATUS.IN_PROGRESS),
    DONE: tasks.filter((task) => task.status === STATUS.DONE)
  }), [tasks])

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark small">✓</div>
          <div>
            <strong>Task Manager</strong>
            <span>Personal workspace</span>
          </div>
        </div>
        <div className="topbar-actions">
          <div className="user-chip">
            <div className="avatar">{user.name?.charAt(0)?.toUpperCase() || 'U'}</div>
            <div className="user-details">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>
          <button className="ghost-button" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <main className="dashboard">
        <div className="dashboard-heading">
          <div>
            <p className="eyebrow">Your workspace</p>
            <h1>Good to see you, {user.name?.split(' ')[0] || 'there'}.</h1>
            <p>Keep your work moving one task at a time.</p>
          </div>
          <button className="primary-button" onClick={() => setModal({ mode: 'create' })}>
            + New task
          </button>
        </div>

        <div className="stats">
          <Stat label="Total tasks" value={tasks.length} />
          <Stat label="Todo" value={grouped.TODO.length} />
          <Stat label="In progress" value={grouped.IN_PROGRESS.length} />
          <Stat label="Completed" value={grouped.DONE.length} />
        </div>

        {notice && <Alert type="success">{notice}</Alert>}
        {error && <Alert type="error">{error}</Alert>}

        {loading ? (
          <div className="loading-panel">
            <div className="spinner"></div>
            <p>Loading your tasks...</p>
          </div>
        ) : (
          <div className="board">
            <TaskColumn
              status="TODO"
              tasks={grouped.TODO}
              onEdit={(task) => setModal({ mode: 'edit', task })}
              onDelete={deleteTask}
            />
            <TaskColumn
              status="IN_PROGRESS"
              tasks={grouped.IN_PROGRESS}
              onEdit={(task) => setModal({ mode: 'edit', task })}
              onDelete={deleteTask}
            />
            <TaskColumn
              status="DONE"
              tasks={grouped.DONE}
              onEdit={(task) => setModal({ mode: 'edit', task })}
              onDelete={deleteTask}
            />
          </div>
        )}
      </main>

      {modal && (
        <TaskModal
          mode={modal.mode}
          task={modal.task}
          onClose={() => setModal(null)}
          onSave={saveTask}
        />
      )}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function TaskColumn({ status, tasks, onEdit, onDelete }) {
  return (
    <section className={`task-column ${status.toLowerCase()}`}>
      <div className="column-header">
        <div className="column-title">
          <span className="status-dot"></span>
          <h2>{STATUS_LABELS[status]}</h2>
        </div>
        <span className="count">{tasks.length}</span>
      </div>

      <div className="task-list">
        {tasks.length === 0 ? (
          <div className="empty-column">
            <span>—</span>
            <p>No tasks here</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
          ))
        )}
      </div>
    </section>
  )
}

function TaskCard({ task, onEdit, onDelete }) {
  return (
    <article className="task-card">
      <div className="task-card-top">
        <span className={`mini-status ${task.status.toLowerCase()}`}>
          {STATUS_LABELS[task.status]}
        </span>
        <span className="task-id">#{task.id}</span>
      </div>
      <h3>{task.title}</h3>
      {task.description && <p>{task.description}</p>}
      <div className="task-card-footer">
        <span>{formatDate(task.createdAt)}</span>
        <div className="card-actions">
          <button onClick={() => onEdit(task)}>Edit</button>
          <button className="danger-text" onClick={() => onDelete(task)}>Delete</button>
        </div>
      </div>
    </article>
  )
}

function TaskModal({ mode, task, onClose, onSave }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || STATUS.TODO
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await onSave(form)
    } catch (err) {
      setError(err.message || 'Could not save task.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal-card" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">{mode === 'edit' ? 'Update task' : 'New task'}</p>
            <h2>{mode === 'edit' ? 'Edit task' : 'Create a task'}</h2>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={submit} className="task-form">
          <Field
            label="Title"
            value={form.title}
            placeholder="e.g. Finish project documentation"
            onChange={(value) => setForm({ ...form, title: value })}
            required
          />

          <label className="field">
            <span>Description</span>
            <textarea
              value={form.description}
              placeholder="Add some useful details..."
              rows="5"
              maxLength="2000"
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </label>

          <label className="field">
            <span>Status</span>
            <select
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value })}
            >
              <option value={STATUS.TODO}>Todo</option>
              <option value={STATUS.IN_PROGRESS}>In Progress</option>
              <option value={STATUS.DONE}>Done</option>
            </select>
          </label>

          {error && <Alert type="error">{error}</Alert>}

          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button className="primary-button" disabled={loading}>
              {loading ? 'Saving...' : mode === 'edit' ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, type = 'text', value, placeholder, onChange, required, minLength }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        minLength={minLength}
      />
    </label>
  )
}

function Alert({ type, children }) {
  return <div className={`alert ${type}`}>{children}</div>
}

function formatDate(value) {
  if (!value) return 'Recently created'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Recently created'
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export default App
