function words() {
  const validStates = ['present', 'correct', 'absent'];

  return rows().map(row => {
    if (row.every(letter => validStates.includes(letter.getAttribute('data-state')))) {
      return row.map(letter => letter.innerText).join('');
    }
  }).filter(Boolean);
}

function displayLastWordMeaning() {
  const lastWord = words()[words.length - 1];

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
  const letterElements = [...document.querySelectorAll('div[aria-roledescription="tile"]')];
  return chunkArray(letterElements, 5);
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
      const validGuessedStates = ['present', 'correct', 'absent'];

      console.log(`Element's data-state changed to: ${newState}, with letter: ${element.innerText}`);
      
      if (validGuessedStates.includes(newState) && isLastLetter(element)) {
        console.log('last letter was guessed');
        displayLastWordMeaning();
      }
    }
  }
}

const observer = new MutationObserver(handleMutation);
const elementsToObserve = document.querySelectorAll('[data-state]');

elementsToObserve.forEach(element => {
  observer.observe(element, { attributes: true });
});


