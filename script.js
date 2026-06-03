const input = document.getElementById('display');
    const buttons = document.querySelectorAll('.keyboard button');
    const capsStatus = document.getElementById('caps-status');
    const shiftStatus = document.getElementById('shift-status');

    let capsOn = false;
    let shiftOn = false;

    function updateStatusBar() {
      capsStatus.className = 'status-pill' + (capsOn ? ' on caps-on' : '');
      shiftStatus.className = 'status-pill' + (shiftOn ? ' on shift-on' : '');
    }

    function updateCapsButton() {
      const capsBtn = document.querySelector('[data-key="CapsLock"]');
      if (capsBtn) capsBtn.classList.toggle('caps-active', capsOn);
    }

    function updateShiftButtons() {
      document.querySelectorAll('[data-key="ShiftLeft"], [data-key="ShiftRight"]').forEach(btn => {
        btn.classList.toggle('shift-active', shiftOn);
      });
    }

    // Inserir caractere na posição do cursor
    function insertChar(char) {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      input.value = input.value.slice(0, start) + char + input.value.slice(end);
      input.setSelectionRange(start + char.length, start + char.length);
    }

    // Backspace na posição do cursor
    function doBackspace() {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      if (start !== end) {
        input.value = input.value.slice(0, start) + input.value.slice(end);
        input.setSelectionRange(start, start);
      } else if (start > 0) {
        input.value = input.value.slice(0, start - 1) + input.value.slice(start);
        input.setSelectionRange(start - 1, start - 1);
      }
    }

    // Qual caractere deve ser inserido pela tecla
    function resolveChar(btn) {
      const key = btn.getAttribute('data-key');
      const shiftVal = btn.getAttribute('data-shift');

      if (!key) return null;
      if (['Escape','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12',
           'Tab','CapsLock','Control','ControlRight','Meta','Alt','AltRight','Fn'].includes(key)) return null;
      if (key === 'Backspace') return 'BACKSPACE';
      if (key === 'Enter') return '\n';
      if (key === ' ') return ' ';

      // Letras a–z, ç
      if (key.length === 1 && /[a-zç]/i.test(key)) {
        const upper = capsOn !== shiftOn; // XOR: um ou outro, não os dois
        return upper ? key.toUpperCase() : key.toLowerCase();
      }

      // Símbolos com shift
      if (shiftOn && shiftVal) return shiftVal;
      return key;
    }

    // Clique nas teclas virtuais
    buttons.forEach(btn => {
      btn.addEventListener('mousedown', e => {
        e.preventDefault();
        input.focus();

        const key = btn.getAttribute('data-key');

        if (key === 'CapsLock') {
          capsOn = !capsOn;
          updateCapsButton();
          updateStatusBar();
          return;
        }

        if (key === 'ShiftLeft' || key === 'ShiftRight') {
          shiftOn = !shiftOn;
          updateShiftButtons();
          updateStatusBar();
          return;
        }

        const char = resolveChar(btn);
        if (char === 'BACKSPACE') {
          doBackspace();
        } else if (char !== null) {
          insertChar(char);
          // Shift é por tecla: desativa após digitar
          if (shiftOn) {
            shiftOn = false;
            updateShiftButtons();
            updateStatusBar();
          }
        }
      });
    });

    // Teclado físico → highlight + capturar estado
    document.addEventListener('keydown', e => {
      const k = e.key;

      // Atualizar estados internos
      if (k === 'CapsLock') {
        capsOn = !capsOn;
        updateCapsButton();
        updateStatusBar();
      }
      if (k === 'Shift') { shiftOn = true; updateShiftButtons(); updateStatusBar(); }

      // Highlight nas teclas
      buttons.forEach(btn => {
        const dk = btn.getAttribute('data-key');
        if (!dk) return;
        const match =
          dk === k ||
          (k === ' ' && dk === ' ') ||
          (k === 'Backspace' && dk === 'Backspace') ||
          (k === 'Enter' && dk === 'Enter') ||
          (k === 'Tab' && dk === 'Tab') ||
          (k === 'CapsLock' && dk === 'CapsLock') ||
          (k === 'Shift' && (dk === 'ShiftLeft' || dk === 'ShiftRight')) ||
          (k === 'Control' && (dk === 'Control' || dk === 'ControlRight')) ||
          (k === 'Alt' && (dk === 'Alt' || dk === 'AltRight')) ||
          (k === 'Escape' && dk === 'Escape') ||
          (k === 'Meta' && dk === 'Meta') ||
          (k.toLowerCase() === dk.toLowerCase());
        if (match) btn.classList.add('pressed');
      });
    });

    document.addEventListener('keyup', e => {
      const k = e.key;
      if (k === 'Shift') { shiftOn = false; updateShiftButtons(); updateStatusBar(); }
      buttons.forEach(btn => btn.classList.remove('pressed'));
    });