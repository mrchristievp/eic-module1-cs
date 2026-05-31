/* ── CS Field Cards ── */
document.querySelectorAll('.cs-card').forEach(card => {
  card.addEventListener('click', () => card.classList.toggle('open'));
});

/* ── Input Device Cards ── */
document.querySelectorAll('.input-card').forEach(card => {
  card.addEventListener('click', () => card.classList.toggle('open'));
});

/* ── Language Sort Activity ── */
(function () {
  const source = document.getElementById('sort-source');
  const dropNatural = document.getElementById('drop-natural');
  const dropFormal = document.getElementById('drop-formal');
  const checkBtn = document.getElementById('lang-check');
  const resetBtn = document.getElementById('lang-reset');
  const feedback = document.getElementById('lang-feedback');
  const allChips = () => document.querySelectorAll('#lang-activity .sort-chip');

  let dragging = null;
  let selected = null; // for tap-based interaction

  function getDropZones() { return [source, dropNatural, dropFormal]; }

  function updateCheckBtn() {
    const remaining = source.querySelectorAll('.sort-chip').length;
    checkBtn.disabled = remaining > 0;
  }

  function attachChipEvents(chip) {
    chip.addEventListener('dragstart', e => {
      dragging = chip;
      chip.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    chip.addEventListener('dragend', () => {
      dragging = null;
      chip.classList.remove('dragging');
    });

    // tap-to-select, then tap target to place
    chip.addEventListener('click', e => {
      e.stopPropagation();
      if (chip.classList.contains('correct') || chip.classList.contains('incorrect')) return;
      document.querySelectorAll('.sort-chip.selected').forEach(c => c.classList.remove('selected'));
      if (selected === chip) {
        selected = null;
      } else {
        chip.classList.add('selected');
        selected = chip;
      }
    });
  }

  function setupDropZone(zone) {
    zone.addEventListener('dragover', e => {
      e.preventDefault();
      zone.classList.add('drag-over');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      if (dragging) {
        zone.appendChild(dragging);
        updateCheckBtn();
      }
    });
    zone.addEventListener('click', () => {
      if (selected) {
        zone.appendChild(selected);
        selected.classList.remove('selected');
        selected = null;
        updateCheckBtn();
      }
    });
  }

  getDropZones().forEach(setupDropZone);
  allChips().forEach(attachChipEvents);

  checkBtn.addEventListener('click', () => {
    let correct = 0;
    const naturalChips = dropNatural.querySelectorAll('.sort-chip');
    const formalChips = dropFormal.querySelectorAll('.sort-chip');

    naturalChips.forEach(c => {
      const ok = c.dataset.answer === 'natural';
      c.classList.toggle('correct', ok);
      c.classList.toggle('incorrect', !ok);
      if (ok) correct++;
    });
    formalChips.forEach(c => {
      const ok = c.dataset.answer === 'formal';
      c.classList.toggle('correct', ok);
      c.classList.toggle('incorrect', !ok);
      if (ok) correct++;
    });

    const total = naturalChips.length + formalChips.length;
    if (correct === total) {
      feedback.textContent = '✓ Perfect — all sorted correctly.';
      feedback.className = 'activity-feedback success';
    } else {
      feedback.textContent = `${correct} of ${total} correct. The highlighted ones are misplaced — try moving them.`;
      feedback.className = 'activity-feedback partial';
    }
  });

  resetBtn.addEventListener('click', () => {
    allChips().forEach(c => {
      c.classList.remove('correct', 'incorrect', 'selected');
      source.appendChild(c);
    });
    feedback.textContent = '';
    feedback.className = 'activity-feedback';
    checkBtn.disabled = true;
    selected = null;
  });
})();

/* ── Algorithm Sequencing ── */
(function () {
  const list = document.getElementById('algo-list');
  const checkBtn = document.getElementById('algo-check');
  const resetBtn = document.getElementById('algo-reset');
  const feedback = document.getElementById('algo-feedback');

  let dragging = null;

  function shuffle() {
    const items = [...list.querySelectorAll('.algo-step')];
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      list.appendChild(items[j]);
      items.splice(j, 1);
    }
    list.querySelectorAll('.algo-step').forEach(s => {
      s.classList.remove('correct', 'incorrect', 'drag-over-top', 'drag-over-bottom');
    });
    feedback.textContent = '';
    feedback.className = 'activity-feedback';
  }

  function attachStep(step) {
    step.addEventListener('dragstart', e => {
      dragging = step;
      step.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    step.addEventListener('dragend', () => {
      dragging = null;
      step.classList.remove('dragging');
      list.querySelectorAll('.algo-step').forEach(s => {
        s.classList.remove('drag-over-top', 'drag-over-bottom');
      });
    });
    step.addEventListener('dragover', e => {
      e.preventDefault();
      if (!dragging || dragging === step) return;
      const rect = step.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      step.classList.remove('drag-over-top', 'drag-over-bottom');
      if (e.clientY < mid) {
        step.classList.add('drag-over-top');
      } else {
        step.classList.add('drag-over-bottom');
      }
    });
    step.addEventListener('dragleave', () => {
      step.classList.remove('drag-over-top', 'drag-over-bottom');
    });
    step.addEventListener('drop', e => {
      e.preventDefault();
      step.classList.remove('drag-over-top', 'drag-over-bottom');
      if (!dragging || dragging === step) return;
      const rect = step.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      if (e.clientY < mid) {
        list.insertBefore(dragging, step);
      } else {
        list.insertBefore(dragging, step.nextSibling);
      }
    });
  }

  list.querySelectorAll('.algo-step').forEach(attachStep);
  shuffle(); // start shuffled

  checkBtn.addEventListener('click', () => {
    const steps = [...list.querySelectorAll('.algo-step')];
    let correct = 0;
    steps.forEach((s, i) => {
      const ok = parseInt(s.dataset.order) === i + 1;
      s.classList.toggle('correct', ok);
      s.classList.toggle('incorrect', !ok);
      if (ok) correct++;
    });
    if (correct === steps.length) {
      feedback.textContent = '✓ That\'s the right order — well done.';
      feedback.className = 'activity-feedback success';
    } else {
      feedback.textContent = `${correct} of ${steps.length} in the right position. Keep rearranging.`;
      feedback.className = 'activity-feedback partial';
    }
  });

  resetBtn.addEventListener('click', shuffle);
})();

/* ── Debug Activity ── */
(function () {
  const answers = ['logic', 'syntax', 'logic', 'syntax'];
  const explanations = [
    'Logic error — the code runs without crashing, it just produces the wrong behavior. The instruction was precise but incorrect.',
    'Syntax error — the missing closing quotation mark breaks the rules of the language. The computer can\'t even parse the line.',
    'Logic error — the app runs correctly and sets the alarm, but the underlying time calculation is off by one hour.',
    'Syntax error — <code>pront</code> is a misspelled command. The language doesn\'t recognize it and stops immediately.'
  ];
  const feedback = document.getElementById('debug-feedback');

  document.querySelectorAll('.debug-scenario').forEach((scenario, i) => {
    const buttons = scenario.querySelectorAll('.bug-choice');
    const scenarioFeedback = scenario.querySelector('.scenario-feedback');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        buttons.forEach(b => { b.disabled = true; });

        const correct = btn.dataset.choice === answers[i];
        btn.classList.add(correct ? 'selected-correct' : 'selected-wrong');
        if (!correct) {
          buttons.forEach(b => {
            if (b.dataset.choice === answers[i]) b.classList.add('selected-correct');
          });
        }
        scenarioFeedback.innerHTML = explanations[i];
        scenarioFeedback.style.color = correct ? 'var(--green)' : 'var(--yellow)';

        // check if all answered
        const allAnswered = [...document.querySelectorAll('.debug-scenario')].every(s =>
          s.querySelector('.bug-choice:disabled')
        );
        if (allAnswered) {
          const totalCorrect = document.querySelectorAll('.bug-choice.selected-correct').length;
          feedback.textContent = `You got ${totalCorrect} of 4 correct.`;
          feedback.className = totalCorrect === 4 ? 'activity-feedback success' : 'activity-feedback partial';
        }
      });
    });
  });
})();
