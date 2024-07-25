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

function displayLastWordMeaning() {
  const words = readWords();
  const lastWord = words[words.length - 1];

  setTimeout(() => {
    console.log("fun fact: " + lastWord);
  }, 500);
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
      const newState = element.getAttribute('data-state');

      console.log(`Element's data-state changed to: ${newState}, with letter: ${element.innerText}`);
      
      if (GUESSED_STATES.includes(newState) && isLastLetter(element)) {
        displayLastWordMeaning();
      }
    }
  }
}

function startGame() {
  console.log('Game is starting...');

  const observer = new MutationObserver(handleMutation);

  tiles().forEach(element => {
    observer.observe(element, { attributes: true });
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
