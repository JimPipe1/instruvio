"use strict";
const module = document.getElementById('module');
if (module) {
    const stepEls = Array.from(module.querySelectorAll('.step'));
    const fill = document.getElementById('prog-fill');
    const text = document.getElementById('prog-text');
    const prev = document.getElementById('prev');
    const next = document.getElementById('next');
    const trackItems = Array.from(module.querySelectorAll('.track__item'));
    const passMark = Number(module.dataset.pass);
    const total = Number(module.dataset.total);
    /** chosen option per question, by question number */
    const answers = new Map();
    /** when set, only these step indexes are visited (the retry run) */
    let queue = null;
    let current = 0;
    module.classList.add('is-interactive');
    const resultIndex = stepEls.length - 1;
    function sequence() {
        return queue ?? stepEls.map((_, i) => i);
    }
    function isAnswered(el) {
        return el.dataset.kind !== 'question' || el.classList.contains('is-answered');
    }
    function show(position, focus = true) {
        const order = sequence();
        current = Math.max(0, Math.min(position, order.length - 1));
        const index = order[current];
        stepEls.forEach((el, i) => {
            el.hidden = i !== index;
        });
        const el = stepEls[index];
        const section = Number(el.dataset.section ?? -1);
        trackItems.forEach((item, i) => {
            item.classList.toggle('is-current', i === section);
            item.classList.toggle('is-done', section > i || index === resultIndex);
        });
        /* The result screen is the last entry in the sequence, so the count of
           teaching steps is one less than the sequence length. */
        const shown = current + 1;
        const teaching = Math.max(1, order.length - 1);
        fill.style.width = `${Math.min(100, (shown / order.length) * 100)}%`;
        text.textContent =
            el.dataset.kind === 'result' ? 'Finished' : `Step ${shown} of ${teaching}`;
        prev.disabled = current === 0;
        next.hidden = el.dataset.kind === 'result';
        next.disabled = !isAnswered(el);
        next.textContent = current === order.length - 1 ? 'See my score' : 'Next';
        if (el.dataset.kind === 'result')
            showResult();
        if (focus) {
            const heading = el.querySelector('h2');
            heading?.focus({ preventScroll: true });
            module.scrollIntoView({ block: 'start', behavior: 'smooth' });
        }
    }
    /* ---------------------------------------------------------- questions */
    module.querySelectorAll('.step--question').forEach((step) => {
        const qNumber = Number(step.dataset.question);
        const options = Array.from(step.querySelectorAll('.option'));
        options.forEach((option) => {
            option.addEventListener('click', () => {
                if (step.classList.contains('is-answered'))
                    return;
                const chosen = Number(option.dataset.option);
                const correct = option.dataset.correct === 'true';
                answers.set(qNumber, chosen);
                step.classList.add('is-answered');
                options.forEach((other) => {
                    other.classList.add('is-locked');
                    if (other.dataset.correct === 'true')
                        other.classList.add('is-correct');
                });
                option.classList.add(correct ? 'is-chosen-right' : 'is-chosen-wrong');
                const verdict = step.querySelector('[data-verdict]');
                if (verdict)
                    verdict.textContent = correct ? 'Correct. ' : 'Not quite. ';
                step.querySelector('[data-feedback]')?.classList.add('is-shown');
                next.disabled = false;
            });
        });
    });
    /* ------------------------------------------------------------- result */
    function showResult() {
        const score = Array.from(answers.entries()).filter(([q, chosen]) => {
            const step = module.querySelector(`.step--question[data-question="${q}"]`);
            return step && Number(step.dataset.answer) === chosen;
        }).length;
        document.getElementById('result-score').textContent = String(score);
        const passed = score >= passMark;
        const verdict = document.getElementById('result-verdict');
        verdict.textContent = passed
            ? `Pass. You needed ${passMark} out of ${total}.`
            : `Not passed this time. You need ${passMark} out of ${total}.`;
        verdict.classList.toggle('is-pass', passed);
        verdict.classList.toggle('is-fail', !passed);
        const breakdown = document.getElementById('result-breakdown');
        breakdown.innerHTML = '';
        trackItems.forEach((item, s) => {
            const questions = Array.from(module.querySelectorAll(`.step--question[data-section="${s}"]`));
            const right = questions.filter((q) => {
                const chosen = answers.get(Number(q.dataset.question));
                return chosen !== undefined && chosen === Number(q.dataset.answer);
            }).length;
            const li = document.createElement('li');
            li.innerHTML = `<span>${item.querySelector('.track__label')?.textContent ?? ''}</span><strong>${right} / ${questions.length}</strong>`;
            breakdown.appendChild(li);
        });
        const missed = missedSteps();
        document.getElementById('retry-missed').hidden = missed.length === 0;
    }
    function missedSteps() {
        return stepEls
            .map((el, i) => ({ el, i }))
            .filter(({ el }) => {
            if (el.dataset.kind !== 'question')
                return false;
            const chosen = answers.get(Number(el.dataset.question));
            return chosen === undefined || chosen !== Number(el.dataset.answer);
        })
            .map(({ i }) => i);
    }
    function resetQuestion(el) {
        el.classList.remove('is-answered');
        el.querySelectorAll('.option').forEach((option) => {
            option.classList.remove('is-locked', 'is-correct', 'is-chosen-right', 'is-chosen-wrong');
        });
        el.querySelector('[data-feedback]')?.classList.remove('is-shown');
        const verdict = el.querySelector('[data-verdict]');
        if (verdict)
            verdict.textContent = '';
    }
    document.getElementById('retry-missed')?.addEventListener('click', () => {
        const missed = missedSteps();
        if (!missed.length)
            return;
        missed.forEach((i) => {
            answers.delete(Number(stepEls[i].dataset.question));
            resetQuestion(stepEls[i]);
        });
        queue = [...missed, resultIndex];
        show(0);
    });
    document.getElementById('restart')?.addEventListener('click', () => {
        answers.clear();
        queue = null;
        stepEls.forEach((el) => el.dataset.kind === 'question' && resetQuestion(el));
        show(0);
    });
    /* ------------------------------------------------------------ controls */
    next.addEventListener('click', () => show(current + 1));
    prev.addEventListener('click', () => show(current - 1));
    document.addEventListener('keydown', (event) => {
        const tag = event.target?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA')
            return;
        if (event.key === 'ArrowRight' && !next.disabled && !next.hidden)
            show(current + 1);
        if (event.key === 'ArrowLeft' && !prev.disabled)
            show(current - 1);
    });
    show(0, false);
}
