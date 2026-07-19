const fs = require('fs');
const path = './client/src/index.css';

const newCss = `
/* ── Form Inputs ────────────────────────────────────────────── */
.modal-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--slate-300);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--slate-50);
  color: var(--slate-900);
  outline: none;
  transition: all var(--transition-fast);
}

.modal-input:focus {
  border-color: var(--emerald-500);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.modal-submit {
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.modal-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

[data-theme='dark'] .modal-input {
  background: var(--slate-800);
  border-color: var(--slate-700);
  color: var(--slate-100);
}

[data-theme='dark'] .modal-input:focus {
  border-color: var(--emerald-400);
}
`;

fs.appendFileSync(path, newCss);
console.log('Form CSS appended successfully');
