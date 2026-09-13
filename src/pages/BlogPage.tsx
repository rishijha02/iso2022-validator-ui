import SEO from "../components/SEO";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getBlogBySlug, type Blog } from "../services/blogService";
import MarkdownContent from "../components/MarkdownContent";

function BlogPage() {
  const { slug = "" } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getBlogBySlug(slug)
      .then(setBlog)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
      <>
      <SEO
        title={blog ? `${blog.title} | FintechSchema` : "Fintech & ISO 20022 Blog | FintechSchema"}
        description={blog?.summary || "Fintech engineering, ISO 20022, payments and banking technology articles from FintechSchema."}
        path={`/blog/${slug}`}
        noindex={Boolean(error)}
        schema={blog ? {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: blog.title,
          description: blog.summary,
          author: {
            "@type": "Person",
            name: blog.author || "Fintech Engineering"
          },
          mainEntityOfPage: `https://www.fintechschema.com/blog/${slug}`,
          image: blog.coverImageUrl ? [blog.coverImageUrl] : undefined,
          datePublished: blog.publishedAt || blog.createdAt || undefined
        } : undefined}
      />
    <div className="blog-page">
      <header className="header">
        <Link to="/" className="logo" style={{ textDecoration: "none" }}>
          <div className="logo-icon">ISO</div>
          <div>
            <div className="logo-title">ISO 20022 Validator</div>
            <div className="logo-subtitle">Fintech Developer Platform</div>
          </div>
        </Link>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/validator">Validator</Link>
          <Link to="/developer-tools">Developer Tools</Link>
        </nav>
      </header>

      <main className="blog-article-shell">
        <Link to="/" className="blog-back">← Back to home</Link>

        {loading && <div className="blog-state">Loading article...</div>}

        {!loading && error && (
          <div className="blog-state">
            <strong>Article not found.</strong>
            <Link to="/">Return to home</Link>
          </div>
        )}

        {!loading && !error && blog && (
          <article className="blog-article">
            {blog.coverImageUrl && (
              <img className="blog-cover-image" src={blog.coverImageUrl} alt={blog.title} />
            )}
            <span className="home-blog-category">{blog.category || "FINTECH"}</span>
            <h1>{blog.title}</h1>
            <p className="blog-article-summary">{blog.summary}</p>
            <div className="blog-article-meta">
              <span>By {blog.author || "Fintech Engineering"}</span>
              <span>
                {blog.publishedAt
                  ? new Intl.DateTimeFormat("en", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    }).format(new Date(blog.publishedAt))
                  : ""}
              </span>
            </div>
            <MarkdownContent content={blog.content} />
          </article>
        )}
      </main>
    </div>
  </>
  );
}

export default BlogPage;
