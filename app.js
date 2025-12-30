// @ts-check

let puzzle = decode(
  location.hash.slice(1) ||
    "OAoxMTgxNTY0OTY5ClRlYWNoZXIgc3RhcnRzIHdpdGggaW50ZXJlc3RpbmcgYXJ0IGxlc3Nvbj8hCkRhbg==",
);

let ui = {
  /**
   * @type {HTMLElement}
   */
  clue: required(document.getElementById("cryptic-clue")),
  /**
   * @type {HTMLElement}
   */
  input: required(document.getElementById("cryptic-input")),
  /**
   * @type {Element}
   */
  check: required(document.getElementById("cryptic-check")),
  /**
   * @type {Element}
   */
  result: required(document.getElementById("cryptic-result")),
  /**
   * @type {Element}
   */
  author: required(document.getElementById("cryptic-author")),
  /**
   * @type {Element}
   */
  keyboard: required(document.getElementById("keyboard")),
  /**
   * @type {Element}
   */
  focus: document.createElement("button"),
  /**
   * @type {Element[]}
   */
  words: [],
  /**
   * @type {Element[]}
   */
  letters: [],
};

/**
 * @template T
 * @param {T} value
 * @returns {NonNullable<T>}
 */
function required(value) {
  if (value != null) {
    return value;
  } else {
    throw new Error("required");
  }
}

/**
 * @param {string} text
 * @returns {number}
 */
function hash(text) {
  let len = text.length;
  let h = 5381;

  for (let i = 0; i < len; i++) {
    h = (h * 33) ^ text.charCodeAt(i);
  }

  return h >>> 0;
}

/**
 * @param {MouseEvent} event
 */
function click({ target }) {
  if (target instanceof HTMLButtonElement) {
    let index = ui.letters.indexOf(target);
    focus(index);
  }
}

/**
 * @param {KeyboardEvent} param
 */
function keydown({ key }) {
  if (key === "Backspace") backspace();
  if (key === "ArrowLeft") left();
  if (key === "ArrowRight") right();
  if (key === "Enter") check();
  let letter = key.toLowerCase();
  if (letter.length === 1 && letter >= "a" && letter <= "z") {
    type(letter);
  }
}

/**
 * @param {string} letter
 */
function type(letter) {
  ui.focus.textContent = letter;
  right();
}

/**
 * @param {number} index
 */
function focus(index) {
  let button = ui.letters[index];

  if (button) {
    ui.focus.removeAttribute("aria-current");
    ui.focus = button;
    ui.focus.setAttribute("aria-current", "");
  }
}

function check() {
  let answer = ui.words.map(word => word.textContent).join(" ");

  if (hash(answer) === puzzle.hash) {
    ui.result.removeAttribute("aria-hidden");
    ui.check.setAttribute("disabled", "");
  } else {
    ui.input.classList.add("shake");
    setTimeout(() => ui.input.classList.remove("shake"), 500);
  }
}

function backspace() {
  if (ui.focus.textContent === "") left();
  ui.focus.textContent = "";
}

function left() {
  let index = ui.letters.indexOf(ui.focus);
  focus(index - 1);
}

function right() {
  let index = ui.letters.indexOf(ui.focus);
  focus(index + 1);
}

function setup() {
  ui.clue.textContent = `${puzzle.clue} (${puzzle.lengths.join(", ")})`;
  ui.author.textContent = puzzle.author;

  for (let length of puzzle.lengths) {
    let word = document.createElement("div");
    word.className = "word";

    for (let i = 0; i < length; i++) {
      let button = document.createElement("button");
      button.tabIndex = -1;
      word.append(button);
      ui.letters.push(button);
    }

    ui.words.push(word);
    ui.input.append(word);
  }

  focus(0);

  ui.input.addEventListener("click", click);
  ui.check.addEventListener("click", check);
  window.addEventListener("keydown", keydown);

  setupKeyboard();
}

function setupKeyboard() {
  let rows = ["qwertyuiop", "asdfghjkl", "zxcvbnm⌫"];

  for (let row of rows) {
    let container = document.createElement("div");
    container.className = "keyboard-row";

    for (let key of row) {
      let button = document.createElement("button");
      button.textContent = key;

      button.addEventListener("click", () => {
        if (key === "⌫") {
          backspace();
        } else {
          type(key);
        }
      });

      container.append(button);
    }

    ui.keyboard.append(container);
  }
}

/**
 * @param {string} base64
 */
function decode(base64) {
  let parts = atob(base64).split("\n");
  let lengths = parts[0].split(",").map((len) => parseInt(len));
  let hash = parseInt(parts[1]) || 0;
  let clue = parts[2];
  let author = parts[3];
  return { lengths, hash, clue, author };
}

/**
 * @param {string} clue
 * @param {string} answer
 * @param {string} author
 * @return {string}
 */
function encode(clue, answer, author) {
  let words = answer.split(" ");
  let lengths = words.map((word) => word.length);
  let secret = hash(answer);
  return btoa(`${lengths.join(",")}\n${secret}\n${clue}\n${author}`);
}

/**
 * @param {string} clue
 * @param {string} answer
 * @param {string} author
 */
function PUZZLE(clue, answer, author) {
  answer = answer.trim().toLowerCase();

  if (!/^[a-z ]*$/.test(answer)) {
    console.log("There are invalid characters in your answer!");
    return;
  }

  let url = new URL(location.href);
  url.hash = encode(clue, answer, author);

  location.href = url.toString();
  location.reload();
}

console.log(
  `

                 %cm%c

         %cMini Cryptic%c

     Play the real thing, it's much better.
            https://minutecryptic.com




          %cMake a cryptic!%c

    You can generate your own puzzle to
send to someone by entering the following
               code into this console:

%c
PUZZLE(
  "The clue that you want to provide",
  "theanswer",
  "Your name"
)

`,
  `
  font-family: serif;
  font-size: 24px;
  background-color: #f5d1fd;
  border: solid 4px black;
  border-radius: 8px;
  width: 24px;
  height: 24px;
  color: black;
  padding: 0 6px;
  font-weight: bold;
  font-style: italic;
`,
  ``,
  `font-family: sans-serif; font-size: 32px;`,
  `font-family: sans-serif; font-size: 16px;`,
  `
  font-family: serif;
  font-size: 24px;
  background-color: #f5d1fd;
  border: solid 4px black;
  border-bottom-width: 6px;
  border-right-width: 6px;
  border-radius: 48px;
  width: 24px;
  height: 24px;
  color: black;
  padding: 4px 16px;
  font-style: italic;
  font-weight: bold;
  `,
  `font-family: sans-serif; font-size: 16px;`,
  ``,
);

// Exposed for creating puzzles from the console.
window.PUZZLE = PUZZLE;

setup();
