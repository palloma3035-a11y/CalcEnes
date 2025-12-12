// Simple calculator logic with keyboard support and basic validation
(() => {
  const expressionEl = document.getElementById('expression');
  const resultEl = document.getElementById('result');
  const buttons = Array.from(document.querySelectorAll('.btn'));

  let expr = '';

  function updateViews() {
    expressionEl.textContent = expr || '0';
    resultEl.textContent = expr || '0';
  }

  function appendValue(val) {
    // Normalize multiplication & division symbols used in UI
    if (val === '×') val = '*';
    if (val === '÷') val = '/';
    // Prevent multiple dots in the same number segment
    if (val === '.') {
      // find last operator to isolate current number token
      const lastOpIndex = Math.max(
        expr.lastIndexOf('+'),
        expr.lastIndexOf('-'),
        expr.lastIndexOf('*'),
        expr.lastIndexOf('/'),
        expr.lastIndexOf('('),
        expr.lastIndexOf(')')
      );
      const token = expr.slice(lastOpIndex + 1);
      if (token.includes('.')) return;
    }
    expr += val;
    updateViews();
  }

  function backspace() {
    expr = expr.slice(0, -1);
    updateViews();
  }

  function clearAll() {
    expr = '';
    updateViews();
  }

  function evaluateExpression() {
    if (!expr) return;
    // convert × and ÷ if any slipped through
    const safeExpr = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
    // Basic validation: allow digits, operators, parentheses, decimal and whitespace
    if (!/^[0-9+\-*/().\s]+$/.test(safeExpr)) {
      resultEl.textContent = 'Error';
      return;
    }
    try {
      // eslint-disable-next-line no-new-func
      const value = Function('"use strict"; return (' + safeExpr + ')')();
      if (typeof value === 'number' && isFinite(value)) {
        // trim to max 10 decimal places
        const rounded = Math.round((value + Number.EPSILON) * 1e10) / 1e10;
        expr = String(rounded);
        updateViews();
      } else {
        resultEl.textContent = 'Error';
      }
    } catch (e) {
      resultEl.textContent = 'Error';
    }
  }

  // attach click handlers
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const value = btn.dataset.value;
      if (action === 'clear') return clearAll();
      if (action === 'backspace') return backspace();
      if (action === 'equals') return evaluateExpression();
      if (value) return appendValue(value);
    });
  });

  // keyboard support
  window.addEventListener('keydown', (e) => {
    const k = e.key;
    // Allow numbers
    if (/^[0-9]$/.test(k)) {
      appendValue(k);
      e.preventDefault();
      return;
    }
    // operators and parentheses
    if (k === '+' || k === '-' || k === '*' || k === '/' || k === '(' || k === ')') {
      appendValue(k);
      e.preventDefault();
      return;
    }
    if (k === 'Enter' || k === '=') {
      evaluateExpression();
      e.preventDefault();
      return;
    }
    if (k === 'Backspace') {
      backspace();
      e.preventDefault();
      return;
    }
    if (k === 'Escape') {
      clearAll();
      e.preventDefault();
      return;
    }
    if (k === '.') {
      appendValue('.');
      e.preventDefault();
      return;
    }
  });

  // initialize
  updateViews();
})();