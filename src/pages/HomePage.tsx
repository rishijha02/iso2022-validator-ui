import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getBlogs, type Blog } from "../services/blogService";

function formatDate(value?: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function HomePage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    getBlogs()
      .then((data) => {
        if (mounted) setBlogs(data);
      })
      .catch(() => {
        if (mounted) setError(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const latestBlogs = useMemo(
    () =>
      [...blogs]
        .sort(
          (a, b) =>
            new Date(b.publishedAt || b.createdAt || 0).getTime() -
            new Date(a.publishedAt || a.createdAt || 0).getTime()
        )
        .slice(0, 3),
    [blogs]
  );

  return (
    <div className="home-page">
      <header className="home-header">
        <Link to="/" className="home-brand">
          <span className="home-brand-icon">ISO</span>
          <span>
            <strong>ISO 20022 Validator</strong>
            <small>Fintech Developer Platform</small>
          </span>
        </Link>

        <nav className="home-nav">
          <Link to="/validator">Validator</Link>
          <Link to="/message-generator">Message Generator</Link>
          <Link to="/developer-tools">Developer Tools</Link>
          <Link to="/documentation">Documentation</Link>
          <Link to="/about">About</Link>
          <div className="home-auth-actions">
            <Link to="/login" className="home-login-link">Login</Link>
            <Link to="/signup" className="home-signup-button">Sign up</Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="home-hero">
          <div className="home-hero-glow home-hero-glow-one" />
          <div className="home-hero-glow home-hero-glow-two" />

          <div className="home-hero-content">
            <span className="home-eyebrow">FINTECH DEVELOPER PLATFORM</span>
            <h1>
              Build. Validate. <span>Understand.</span>
            </h1>
            <p>
              Practical tools for ISO 20022, payments and financial messaging.
              Validate XML, generate messages, inspect identifiers and learn how
              modern payment systems work.
            </p>

            <div className="home-hero-actions">
              <Link to="/validator" className="home-primary-button">
                Open ISO 20022 Validator →
              </Link>
              <Link to="/developer-tools" className="home-secondary-button">
                Explore Developer Tools
              </Link>
            </div>

            <div className="home-trust-row">
              <span>✓ ISO 20022 validation</span>
              <span>✓ Payment developer tools</span>
              <span>✓ Fintech engineering insights</span>
            </div>
          </div>
        </section>

        <section className="home-blog-section">
          <div className="home-section-heading">
            <div>
              <span className="home-section-eyebrow">LATEST FROM THE BLOG</span>
              <h2>Fintech engineering, explained simply.</h2>
              <p>
                Deep dives into payment processing, ISO 20022, cards, banking
                infrastructure and the systems behind financial transactions.
              </p>
            </div>
            <span className="home-blog-mark">BLOG</span>
          </div>

          {loading && (
            <div className="home-blog-grid">
              {[1, 2, 3].map((item) => (
                <div className="home-blog-card home-blog-skeleton" key={item}>
                  <div className="skeleton-line skeleton-category" />
                  <div className="skeleton-line skeleton-title" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line short" />
                </div>
              ))}
            </div>
          )}

          {!loading && !error && latestBlogs.length > 0 && (
            <div className="home-blog-grid">
              {latestBlogs.map((blog) => (
                <article className="home-blog-card" key={blog.id}>
                  <div className="home-blog-card-top">
                    <span className="home-blog-category">
                      {blog.category || "FINTECH"}
                    </span>
                    <span className="home-blog-arrow">↗</span>
                  </div>

                  <h3>{blog.title}</h3>
                  <p>{blog.summary}</p>

                  <div className="home-blog-meta">
                    <span>{blog.author || "Fintech Engineering"}</span>
                    <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
                  </div>

                  <Link to={`/blog/${blog.slug}`} className="home-read-link">
                    Read article <span>→</span>
                  </Link>
                </article>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="home-blog-empty">
              <strong>Blog is temporarily unavailable.</strong>
              <span>Please try again shortly.</span>
            </div>
          )}

          {!loading && !error && latestBlogs.length === 0 && (
            <div className="home-blog-empty">
              <strong>Articles are coming soon.</strong>
              <span>New fintech engineering content will appear here.</span>
            </div>
          )}

          {!loading && latestBlogs.length > 0 && (
            <div className="home-blog-footer">
              <span>More payment engineering insights</span>
              <span className="home-blog-footer-line" />
            </div>
          )}
        </section>

        <section className="home-tools-section">
          <div className="home-section-heading compact">
            <div>
              <span className="home-section-eyebrow">DEVELOPER TOOLBOX</span>
              <h2>Everything you need around the message.</h2>
            </div>
            <Link to="/developer-tools" className="home-view-all">
              View all tools →
            </Link>
          </div>

          <div className="home-tools-grid">
            <Link to="/validator" className="home-tool-card">
              <span className="home-tool-number">01</span>
              <strong>ISO 20022 Validator</strong>
              <span>Validate XML against supported schemas and profiles.</span>
            </Link>
            <Link to="/message-generator" className="home-tool-card">
              <span className="home-tool-number">02</span>
              <strong>Message Generator</strong>
              <span>Generate payment messages for common use cases.</span>
            </Link>
            <Link to="/developer-tools/identifier-validator" className="home-tool-card">
              <span className="home-tool-number">03</span>
              <strong>Identifier Validator</strong>
              <span>Check IBAN, BIC and other payment identifiers.</span>
            </Link>
            <Link to="/xml-to-json" className="home-tool-card">
              <span className="home-tool-number">04</span>
              <strong>XML → JSON</strong>
              <span>Convert structured financial messages for development.</span>
            </Link>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <span>ISO 20022 Validator</span>
        <span>Built for payment & fintech developers</span>
      </footer>
    </div>
  );
}

export default HomePage;
