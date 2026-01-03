const questionInput = document.getElementById('question-input');
const askButton = document.getElementById('ask-button');
const answerText = document.getElementById('answer-text');
const loadingIndicator = document.getElementById('loading-indicator');
const sourcesAccordion = document.getElementById('sources-accordion');
const sourcesContent = document.getElementById('sources-content');
const answerArea = document.getElementById('answer-area');

/* ---------- helpers: class-based show/hide (no hidden attribute) ---------- */
const show = (el) => el.classList.remove('is-hidden');
const hide = (el) => el.classList.add('is-hidden');

/* ---------- submit on Enter (without Shift) ---------- */
questionInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    askButton.click();
  }
});

/* ---------- ask flow ---------- */
askButton.addEventListener('click', async (evt) => {
  evt.preventDefault();

  const question = questionInput.value.trim();
  if (!question) {
    alert('Please enter a question.');
    return;
  }

  // UI updates
  show(answerArea);
  askButton.disabled = true;
  show(loadingIndicator);
  answerText.textContent = '…';
  hide(sourcesAccordion);
  sourcesAccordion.open = false;
  sourcesContent.innerHTML = '';

  try {
    const response = await fetch('http://localhost:4000/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      let errorMsg = `HTTP error! Status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMsg += ` - ${errorData.error || 'Unknown server error'}`;
      } catch (_) { /* ignore parse issues */ }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    console.log('[DEBUG] Received data:', JSON.stringify(data, null, 2));

    // Render Markdown (sanitized if DOMPurify is present)
    if (data.answer) {
      if (typeof DOMPurify !== 'undefined') {
        answerText.innerHTML = DOMPurify.sanitize(marked.parse(data.answer));
      } else {
        console.warn('DOMPurify not loaded. Rendering Markdown without sanitization.');
        answerText.innerHTML = marked.parse(data.answer);
      }
    } else {
      answerText.textContent = 'No answer received.';
    }

    // Sources
    let sourcesDisplayed = false;
    sourcesContent.innerHTML = '';

    if (Array.isArray(data.sources) && data.sources.length > 0) {
      const firstSource = data.sources[0];
      const sourceType =
        firstSource.type === 'web'
          ? 'web'
          : firstSource.type === 'knowledgeBase'
          ? 'knowledgeBase'
          : 'unknown';

      if (sourceType === 'knowledgeBase') {
        console.log('[DEBUG] Displaying Knowledge Base sources.');
        show(sourcesAccordion);
        sourcesDisplayed = true;

        data.sources.forEach((source, index) => {
          const sourceDiv = document.createElement('div');
          sourceDiv.className = 'source-item kb-source';

          const metadataP = document.createElement('p');
          metadataP.className = 'source-metadata';
          const sim =
            typeof source.similarity === 'number'
              ? source.similarity.toFixed(4)
              : 'N/A';
          metadataP.textContent = `Source ${index + 1}: ${source.metadata?.source || 'Unknown Source'} (Similarity: ${sim})`;

          const contentPre = document.createElement('pre');
          contentPre.className = 'source-content';
          contentPre.textContent = source.content || '';

          sourceDiv.appendChild(metadataP);
          sourceDiv.appendChild(contentPre);
          sourcesContent.appendChild(sourceDiv);
        });
      } else if (sourceType === 'web') {
        console.log('[DEBUG] Displaying Web Search sources.');
        show(sourcesAccordion);
        sourcesDisplayed = true;

        data.sources.forEach((source, index) => {
          const sourceDiv = document.createElement('div');
          sourceDiv.className = 'source-item web-source';

          const metadataP = document.createElement('p');
          metadataP.className = 'source-metadata';
          metadataP.textContent = `Source ${index + 1}: `;

          const titleLink = document.createElement('a');
          titleLink.href = source.url || '#';
          titleLink.textContent = source.title || 'Untitled Web Source';
          titleLink.target = '_blank';
          titleLink.rel = 'noopener noreferrer';

          metadataP.appendChild(titleLink);
          sourceDiv.appendChild(metadataP);
          sourcesContent.appendChild(sourceDiv);
        });
      } else {
        console.log('[DEBUG] Encountered unknown source type:', data.sources);
      }
    }

    if (!sourcesDisplayed) {
      console.log('[DEBUG] No displayable sources found.');
      hide(sourcesAccordion);
    }
  } catch (error) {
    console.error('Error fetching answer:', error);
    show(answerArea);
    answerText.textContent = `Error: ${error.message || 'Could not fetch answer.'}`;
    hide(sourcesAccordion);
  } finally {
    askButton.disabled = false;
    hide(loadingIndicator);
  }
});
