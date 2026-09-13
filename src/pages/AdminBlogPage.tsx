import SEO from "../components/SEO";
import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { createBlog, deleteBlog, updateBlog, type BlogRequest } from "../services/adminBlogService";
import { getBlogs, type Blog } from "../services/blogService";
import { clearSession, getRole, getToken, getUsername } from "../services/authService";
import MarkdownContent from "../components/MarkdownContent";

const emptyForm: BlogRequest = { title: "", slug: "", summary: "", coverImageUrl: "", content: "", category: "Payments", author: "", published: false };

/**
 * Converts free text into a URL-safe slug:
 * "What happens inside the HSM?" -> "what-happens-inside-the-hsm"
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")   // strip punctuation (?, !, ., etc.)
    .replace(/[\s_]+/g, "-")    // spaces/underscores -> hyphen
    .replace(/-+/g, "-")        // collapse repeated hyphens
    .replace(/^-+|-+$/g, "");   // trim leading/trailing hyphens
}

function AdminBlogPage() {
  const token = getToken();
  const role = getRole().toUpperCase();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [form, setForm] = useState<BlogRequest>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Tracks whether the admin has manually typed into the Slug field.
  // Until they do, the slug auto-follows the Title field.
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [previewContent, setPreviewContent] = useState(false);

  useEffect(() => {
    if (!token || role !== "ADMIN") return;
    getBlogs().then(setBlogs).catch(() => setError("Unable to load published blogs."));
  }, [token, role]);

  if (!token || role !== "ADMIN") return <Navigate to="/login" replace state={{ from: "/admin/blogs" }} />;

  function change<K extends keyof BlogRequest>(key: K, value: BlogRequest[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleTitleChange(value: string) {
    setForm((current) => ({
      ...current,
      title: value,
      // auto-derive the slug from the title until the admin overrides it
      slug: slugManuallyEdited ? current.slug : slugify(value),
    }));
  }

  function handleSlugChange(value: string) {
    setSlugManuallyEdited(true);
    change("slug", value);
  }

  function startEdit(blog: Blog) {
    setEditingId(blog.id);
    setForm({ title: blog.title, slug: blog.slug, summary: blog.summary || "", coverImageUrl: blog.coverImageUrl || "", content: blog.content, category: blog.category || "", author: blog.author || "", published: blog.published });
    // editing an existing post: treat its slug as intentional so
    // tweaking the title doesn't silently change a published URL
    setSlugManuallyEdited(true);
    setMessage("");
    setError("");
    setPreviewContent(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setSlugManuallyEdited(false);
    setMessage("");
    setError("");
    setPreviewContent(false);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true); setMessage(""); setError("");

    // Sanitize right before sending — a safety net regardless of
    // whatever ended up in the Slug field.
    const payload: BlogRequest = { ...form, slug: slugify(form.slug) };

    if (!payload.slug) {
      setError("Slug cannot be empty — check the title or slug field.");
      setLoading(false);
      return;
    }

    try {
      if (editingId === null) {
        const created = await createBlog(token!, payload);
        setBlogs((current) => [created, ...current]);
        setMessage("Blog created successfully.");
      } else {
        const updated = await updateBlog(token!, editingId, payload);
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

  const slugPreview = slugify(form.slug);

  return (
      <>
      <SEO
        title={'Admin Blog Management | FintechSchema'}
        description={'Manage FintechSchema blog content.'}
        path={'/admin/blogs'}
        noindex
      />
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
              <label>Title<input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} required /></label>
              <label>
                Slug
                <input value={form.slug} onChange={(e) => handleSlugChange(e.target.value)} placeholder="why-real-time-payments-matter" required />
                {form.slug && slugPreview !== form.slug && (
                  <small style={{ display: "block", marginTop: 4, opacity: 0.65 }}>
                    Will be saved as: {slugPreview || "(empty — check title)"}
                  </small>
                )}
              </label>
              <label>Category<input value={form.category} onChange={(e) => change("category", e.target.value)} /></label>
              <label>Author<input value={form.author} onChange={(e) => change("author", e.target.value)} /></label>
            </div>
            <label>Summary<textarea rows={3} value={form.summary} onChange={(e) => change("summary", e.target.value)} /></label>
            <label>Cover image URL<input value={form.coverImageUrl} onChange={(e) => change("coverImageUrl", e.target.value)} placeholder="https://..." />{form.coverImageUrl && <img className="admin-cover-preview" src={form.coverImageUrl} alt="Cover preview" onError={(e) => { e.currentTarget.style.display = "none"; }} />}</label>
            <div className="admin-content-editor">
              <div className="admin-content-toolbar">
                <div>
                  <strong>Content</strong>
                  <span>Markdown supported</span>
                </div>
                <div className="admin-content-tabs">
                  <button type="button" className={!previewContent ? "active" : ""} onClick={() => setPreviewContent(false)}>Edit</button>
                  <button type="button" className={previewContent ? "active" : ""} onClick={() => setPreviewContent(true)}>Preview</button>
                </div>
              </div>
              {!previewContent ? (
                <textarea rows={18} value={form.content} onChange={(e) => change("content", e.target.value)} placeholder={`# How does an HSM protect payment keys?\n\nWrite your article here...\n\n## Key management\n\n- LMK\n- ZMK\n- ZPK\n\n\`\`\`java\nString example = "payment";\n\`\`\`\n\n![HSM architecture](https://example.com/hsm.png)`} required />
              ) : (
                <div className="admin-content-preview">
                  {form.content.trim() ? <MarkdownContent content={form.content} /> : <span className="admin-preview-empty">Start writing to see the article preview.</span>}
                </div>
              )}
              {!previewContent && (
                <div className="admin-markdown-help">
                  <span><code># Heading</code></span>
                  <span><code>**bold**</code></span>
                  <span><code>- bullet</code></span>
                  <span><code>1. numbered</code></span>
                  <span><code>`code`</code></span>
                  <span><code>```code block```</code></span>
                  <span><code>[link](https://...)</code></span>
                  <span><code>![image](https://...)</code></span>
                </div>
              )}
            </div>
            <label className="admin-checkbox"><input type="checkbox" checked={form.published} onChange={(e) => change("published", e.target.checked)} /> Publish this article</label>
            {error && <div className="auth-error">{error}</div>}
            {message && <div className="auth-success">{message}</div>}
            <div className="admin-form-actions"><button className="admin-primary-button" disabled={loading}>{loading ? "Saving..." : editingId === null ? "Create blog →" : "Save changes →"}</button>{editingId !== null && <button type="button" className="admin-secondary-button" onClick={resetForm}>Cancel</button>}</div>
          </form>
        </section>

        <section className="admin-list-section"><div className="admin-list-heading"><h2>Published articles</h2><span>{blogs.length} article{blogs.length === 1 ? "" : "s"}</span></div>
          <div className="admin-blog-list">
            {blogs.length === 0 && <div className="admin-empty">No published articles yet. Create your first one above.</div>}
            {blogs.map((blog) => <article className="admin-blog-row" key={blog.id}><div>{blog.coverImageUrl && <img className="admin-row-cover" src={blog.coverImageUrl} alt="" />}<span className="home-blog-category">{blog.category || "FINTECH"}</span><h3>{blog.title}</h3><p>{blog.summary}</p></div><div className="admin-row-actions"><Link to={`/blog/${blog.slug}`}>View</Link><button onClick={() => startEdit(blog)}>Edit</button><button className="danger" onClick={() => handleDelete(blog.id)}>Delete</button></div></article>)}
          </div>
        </section>
      </main>
    </div>
  </>
  );
}

export default AdminBlogPage;
