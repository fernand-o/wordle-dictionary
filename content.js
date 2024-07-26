function tiles() {
  return [...document.querySelectorAll('div[aria-roledescription="tile"]')]
}

function displayWordMeaning(lastLetterElement) {
  const currentRow = rows().find(row => {
    return row[row.length - 1] == lastLetterElement
  });
  const word = currentRow.map(letter => letter.innerText).join('');

  fetchWordMeaning(word, meaning => {
    createAndShowDialog(lastLetterElement, word, meaning);
  });
}

function fetchWordMeaning(word, callback) {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en_US/${word}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const meaning = data[0].meanings[0].definitions[0].definition;

      callback(meaning);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

function rows() {
  return chunkArray(tiles(), 5);
}

function isLastLetter(element) {
  return rows().some(row => {
    return row[row.length - 1] == element
  });
}

function hasGameEndedWithWrongGuess() {
  return rows().at(-1).some(letter => letter.getAttribute('data-state') == 'absent');
}

function displaySecretWordMeaning() {
  setTimeout(() => {
    const secretWordElement = document.querySelector('div[aria-live="polite"]');
    const secretWord = secretWordElement.innerText;

    fetchWordMeaning(secretWord, meaning => {
      createAndShowDialog(secretWordElement, secretWord, meaning);
    });
  }, 500);
}

function createAndShowDialog(targetElement, word, meaning) {
  let marginGap = 30;
  let rightSide = document.querySelectorAll('.meaning-dialog').length % 2 == 0;
  let rect = targetElement.parentElement.getBoundingClientRect();
  let dialog = document.createElement('div');

  dialog.className = 'meaning-dialog';
  dialog.innerHTML = `
    <div class="meaning-dialog-content">
      <p><b>${word}</b>: ${meaning}</p>
    </div>
  `;
  dialog.style.top = (window.scrollY + rect.top) + 'px';

  if (rightSide) {
    let left = window.scrollX + rect.left + rect.width + marginGap;
    dialog.style.left = `${left}px`;
  } else {
    let right = window.scrollX + rect.right + marginGap
    dialog.style.right = `${right}px`;
  }

  document.body.appendChild(dialog);
}

const GUESSED_STATES = ['present', 'correct', 'absent'];

function handleMutation(mutationsList) {
  for (const mutation of mutationsList) {
    if (mutation.type === 'attributes' && mutation.attributeName === 'data-state') {
      const element = mutation.target;
      const state = element.getAttribute('data-state');

      if (GUESSED_STATES.includes(state) && isLastLetter(element)) {
        displayWordMeaning(element);

        if (hasGameEndedWithWrongGuess()) {
          displaySecretWordMeaning();
        }
      }
    }
  }
}

function startGame() {
  const tilesObserver = new MutationObserver(handleMutation);

  tiles().forEach(element => {
    tilesObserver.observe(element, { attributes: true });
  });
}

function observeGameStart() {
  const game = document.querySelector('[id="wordle-app-game"]');

  if (game) {
    startGame();
  } else {
    setTimeout(observeGameStart, 500);
  }
}

observeGameStart();