import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { createBlog, deleteBlog, updateBlog, type BlogRequest } from "../services/adminBlogService";
import { getBlogs, type Blog } from "../services/blogService";
import { clearSession, getRole, getToken, getUsername } from "../services/authService";

const emptyForm: BlogRequest = { title: "", slug: "", summary: "", content: "", category: "Payments", author: "", published: false };

function AdminBlogPage() {
  const token = getToken();
  const role = getRole().toUpperCase();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [form, setForm] = useState<BlogRequest>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || role !== "ADMIN") return;
    getBlogs().then(setBlogs).catch(() => setError("Unable to load published blogs."));
  }, [token, role]);

  if (!token || role !== "ADMIN") return <Navigate to="/login" replace state={{ from: "/admin/blogs" }} />;

  function change<K extends keyof BlogRequest>(key: K, value: BlogRequest[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function startEdit(blog: Blog) {
    setEditingId(blog.id);
    setForm({ title: blog.title, slug: blog.slug, summary: blog.summary || "", content: blog.content, category: blog.category || "", author: blog.author || "", published: blog.published });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() { setEditingId(null); setForm(emptyForm); setMessage(""); setError(""); }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true); setMessage(""); setError("");
    try {
      if (editingId === null) {
        const created = await createBlog(token!, form);
        setBlogs((current) => [created, ...current]);
        setMessage("Blog created successfully.");
      } else {
        const updated = await updateBlog(token!, editingId, form);
        setBlogs((current) => current.map((blog) => blog.id === editingId ? updated : blog));
        setMessage("Blog updated successfully.");
      }
      resetForm();
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to save blog"); }
    finally { setLoading(false); }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this blog? This cannot be undone.")) return;
    try { await deleteBlog(token!, id); setBlogs((current) => current.filter((blog) => blog.id !== id)); setMessage("Blog deleted."); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to delete blog"); }
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <Link to="/" className="home-brand"><span className="home-brand-icon">ISO</span><span><strong>ISO 20022 Validator</strong><small>Admin workspace</small></span></Link>
        <div className="admin-header-actions"><span>Hi, {getUsername() || "Admin"}</span><Link to="/">View site</Link><button onClick={() => { clearSession(); window.location.href = "/"; }}>Logout</button></div>
      </header>

      <main className="admin-content">
        <div className="admin-title"><div><span className="home-section-eyebrow">ADMIN CONSOLE</span><h1>{editingId === null ? "Create a blog article" : "Edit blog article"}</h1><p>Publish fintech engineering content directly to the homepage.</p></div><Link to="/signup" className="admin-secondary-button">+ Add user</Link></div>

        <section className="admin-editor-card">
          <form onSubmit={handleSubmit} className="admin-blog-form">
            <div className="admin-form-grid">
              <label>Title<input value={form.title} onChange={(e) => change("title", e.target.value)} required /></label>
              <label>Slug<input value={form.slug} onChange={(e) => change("slug", e.target.value)} placeholder="why-real-time-payments-matter" required /></label>
              <label>Category<input value={form.category} onChange={(e) => change("category", e.target.value)} /></label>
              <label>Author<input value={form.author} onChange={(e) => change("author", e.target.value)} /></label>
            </div>
            <label>Summary<textarea rows={3} value={form.summary} onChange={(e) => change("summary", e.target.value)} /></label>
            <label>Content<textarea rows={14} value={form.content} onChange={(e) => change("content", e.target.value)} required /></label>
            <label className="admin-checkbox"><input type="checkbox" checked={form.published} onChange={(e) => change("published", e.target.checked)} /> Publish this article</label>
            {error && <div className="auth-error">{error}</div>}
            {message && <div className="auth-success">{message}</div>}
            <div className="admin-form-actions"><button className="admin-primary-button" disabled={loading}>{loading ? "Saving..." : editingId === null ? "Create blog →" : "Save changes →"}</button>{editingId !== null && <button type="button" className="admin-secondary-button" onClick={resetForm}>Cancel</button>}</div>
          </form>
        </section>

        <section className="admin-list-section"><div className="admin-list-heading"><h2>Published articles</h2><span>{blogs.length} article{blogs.length === 1 ? "" : "s"}</span></div>
          <div className="admin-blog-list">
            {blogs.length === 0 && <div className="admin-empty">No published articles yet. Create your first one above.</div>}
            {blogs.map((blog) => <article className="admin-blog-row" key={blog.id}><div><span className="home-blog-category">{blog.category || "FINTECH"}</span><h3>{blog.title}</h3><p>{blog.summary}</p></div><div className="admin-row-actions"><Link to={`/blog/${blog.slug}`}>View</Link><button onClick={() => startEdit(blog)}>Edit</button><button className="danger" onClick={() => handleDelete(blog.id)}>Delete</button></div></article>)}
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminBlogPage;
