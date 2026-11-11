"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <div style={{ margin: "auto", width: "100%", maxWidth: 400, padding: 24 }}>
      <form action={action} className="card stack">
        <h1 style={{ fontSize: 28 }}>Área do lojista</h1>
        <div className="field">
          <label htmlFor="password">Senha</label>
          <input id="password" name="password" type="password" className="input" required autoFocus />
        </div>
        {state?.error && <div className="notice bad" role="alert">{state.error}</div>}
        <button className="btn primary" disabled={pending}>Entrar</button>
      </form>
    </div>
  );
}
