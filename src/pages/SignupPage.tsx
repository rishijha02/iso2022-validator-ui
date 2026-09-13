import SEO from "../components/SEO";

import {  useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { createUser, getRole, getToken } from "../services/authService";

function SignupPage() {
  const admin = getRole().toUpperCase() === "ADMIN";
  const token = getToken();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!token || !admin) {
      setError("Only an authenticated administrator can create users with the current backend API.");
      return;
    }
    setLoading(true);
    try {
      const created = await createUser({ username, password, role }, token);
      setMessage(`${created.username} was created successfully as ${created.role}.`);
      setUsername("");
      setPassword("");
      setRole("USER");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create user");
    } finally {
      setLoading(false);
    }
  }

  return (
      <>
      <SEO
        title={'Sign Up | FintechSchema'}
        description={'Create a FintechSchema account.'}
        path={'/signup'}
        noindex
      />
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <Link to="/" className="auth-brand"><span className="auth-brand-icon">ISO</span><span>ISO 20022 Validator</span></Link>
        <div className="auth-heading"><span>ACCOUNT MANAGEMENT</span><h1>Create account</h1><p>New users are created through your secured admin API.</p></div>
        {!admin && <div className="auth-notice">Your current backend exposes user creation under <strong>/v1/api/admin/users</strong>, so an administrator must be signed in to create an account.</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <label>Username<input value={username} onChange={(e) => setUsername(e.target.value)} required /></label>
          <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} /></label>
          {admin && <label>Role<select value={role} onChange={(e) => setRole(e.target.value as "USER" | "ADMIN")}><option value="USER">USER</option><option value="ADMIN">ADMIN</option></select></label>}
          {error && <div className="auth-error">{error}</div>}
          {message && <div className="auth-success">{message}</div>}
          <button disabled={loading || !admin}>{loading ? "Creating..." : "Create account →"}</button>
        </form>
        <div className="auth-footer"><span>Already have an account?</span><Link to="/login">Sign in</Link></div>
        <Link to="/" className="auth-back">← Back to home</Link>
      </div>
    </div>
  </>
  );
}

export default SignupPage;
