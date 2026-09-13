import SEO from "../components/SEO";
import {  useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login, saveSession } from "../services/authService";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login({ username, password });
      saveSession(response);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from || (response.role?.toUpperCase() === "ADMIN" ? "/admin/blogs" : "/"), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
      <>
      <SEO
        title={'Login | FintechSchema'}
        description={'Sign in to your FintechSchema account.'}
        path={'/login'}
        noindex
      />
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-brand">
          <span className="auth-brand-icon">ISO</span>
          <span>ISO 20022 Validator</span>
        </Link>
        <div className="auth-heading">
          <span>WELCOME BACK</span>
          <h1>Sign in</h1>
          <p>Access your fintech developer workspace.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Username<input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required /></label>
          <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></label>
          {error && <div className="auth-error">{error}</div>}
          <button disabled={loading}>{loading ? "Signing in..." : "Sign in →"}</button>
        </form>

        <div className="auth-footer">
          <span>Need an account?</span>
          <Link to="/signup">Create account</Link>
        </div>
        <Link to="/" className="auth-back">← Back to home</Link>
      </div>
    </div>
  </>
  );
}

export default LoginPage;
