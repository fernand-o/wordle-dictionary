var css = `
.meaning-dialog {
  position: absolute;
  background: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.meaning-dialog-content {
  background-color: var(--color-absent);
  color: var(--key-evaluated-text-color-absent);
  padding: 10px;
  width: 300px;
  text-align: center;
  position: relative;
}
`;

var style = document.createElement('style');
style.appendChild(document.createTextNode(css));
document.head.appendChild(style);

function createAndShowDialog(targetElement, word, meaning) {
  let rightSide = document.querySelectorAll('.meaning-dialog').length % 2 == 0;

  var dialog = document.createElement('div');
  dialog.className = 'meaning-dialog';
  dialog.innerHTML = `
    <div class="meaning-dialog-content">
      <p><b>${word}</b>: ${meaning}</p>
    </div>
  `;

  var rect = targetElement.parentElement.getBoundingClientRect();
  dialog.style.top = (window.scrollY + rect.top) + 'px';
  dialog.style.display = 'flex';  

  if (rightSide) {
    dialog.style.left = (window.scrollX + rect.left + rect.width + 30) + 'px';
  } else {
    dialog.style.right = (window.scrollX + rect.right + 30) + 'px';
  }

  document.body.appendChild(dialog);
}

const GUESSED_STATES = ['present', 'correct', 'absent'];

function tiles() {
  return [...document.querySelectorAll('div[aria-roledescription="tile"]')]
}

function readWords() {
  return rows().map(row => {
    if (row.every(letter => GUESSED_STATES.includes(letter.getAttribute('data-state')))) {
      return row.map(letter => letter.innerText).join('');
    }
  }).filter(Boolean);
}

function displayLastWordMeaning(lastLetterElement) {
  const words = readWords();
  const lastWord = words[words.length - 1];

  fetchWordMeaning(lastWord, meaning => {
    console.log(`Meaning: ${meaning}`);

    createAndShowDialog(lastLetterElement, lastWord, meaning);
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
  return rows().find(row => {
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

function handleMutation(mutationsList) {
  for (const mutation of mutationsList) {
    if (mutation.type === 'attributes' && mutation.attributeName === 'data-state') {
      const element = mutation.target;
      const state = element.getAttribute('data-state');

      if (GUESSED_STATES.includes(state) && isLastLetter(element)) {
        displayLastWordMeaning(element);

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

