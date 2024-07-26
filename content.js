var css = `
.meaning-dialog {
  position: absolute;
  background: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.meaning-dialog-content {
  background: #fff;
  padding: 10px;
  border-radius: 5px;
  width: 300px;
  text-align: center;
  position: relative;
}
.meaning-dialog-close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 20px;
  cursor: pointer;
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
      <span class="meaning-dialog-close" style="cursor: pointer;">&times;</span>
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

  dialog.querySelector('.meaning-dialog-close').addEventListener('click', function() {
    dialog.remove();
  });

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

  console.log(`Last word: ${lastWord}`);  

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

function handleMutation(mutationsList) {
  for (const mutation of mutationsList) {
    if (mutation.type === 'attributes' && mutation.attributeName === 'data-state') {
      const element = mutation.target;
      const state = element.getAttribute('data-state');

      console.log(`Element's data-state changed to: ${state}, with letter: ${element.innerText}`);
      
      if (GUESSED_STATES.includes(state) && isLastLetter(element)) {
        displayLastWordMeaning(element);
      }
    }
  }
}

function startGame() {
  console.log('Game is starting...');

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

