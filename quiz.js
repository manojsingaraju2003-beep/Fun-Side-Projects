/* ================================================================
   KING'S COURT — QUIZ CONTROLLER

   Add or edit questions in the questions array below. The correct
   value is the zero-based position of the correct answer.
   ================================================================ */

const questions = [
  {
    category: "Records",
    question: "LeBron James became the NBA’s all-time regular-season scoring leader in 2023.",
    answers: ["True", "False"],
    correct: 0,
    explanation: "True. He passed Kareem Abdul-Jabbar’s long-standing record in February 2023."
  },
  {
    category: "Draft night",
    question: "Which team selected LeBron with the first pick of the 2003 NBA Draft?",
    answers: ["Miami Heat", "Cleveland Cavaliers", "Los Angeles Lakers", "Chicago Bulls"],
    correct: 1,
    explanation: "The Cleveland Cavaliers selected the hometown star first overall in 2003."
  },
  {
    category: "Championships",
    question: "With which team did LeBron win his first NBA championship?",
    answers: ["Cleveland Cavaliers", "Los Angeles Lakers", "Miami Heat", "San Antonio Spurs"],
    correct: 2,
    explanation: "LeBron won his first championship with Miami in 2012."
  },
  {
    category: "Origins",
    question: "In which Ohio city was LeBron James born?",
    answers: ["Cleveland", "Columbus", "Cincinnati", "Akron"],
    correct: 3,
    explanation: "LeBron was born in Akron, Ohio."
  },
  {
    category: "Finals history",
    question: "Which team did Cleveland defeat after coming back from 3–1 in the 2016 NBA Finals?",
    answers: ["Golden State Warriors", "Boston Celtics", "San Antonio Spurs", "Phoenix Suns"],
    correct: 0,
    explanation: "Cleveland completed the historic comeback against the 73-win Golden State Warriors."
  },
  {
    category: "Before the NBA",
    question: "Which high school did LeBron attend?",
    answers: ["Oak Hill Academy", "Sierra Canyon", "St. Vincent–St. Mary", "Montverde Academy"],
    correct: 2,
    explanation: "He starred for St. Vincent–St. Mary High School in Akron."
  },
  {
    category: "Culture",
    question: "What is the title of the 2021 film starring LeBron James?",
    answers: ["Coach Carter", "Hustle", "Air", "Space Jam: A New Legacy"],
    correct: 3,
    explanation: "LeBron starred in Space Jam: A New Legacy, released in 2021."
  },
  {
    category: "The GOAT debate",
    question: "LeBron needed Scottie Pippen to win his first NBA championship.",
    answers: ["True", "False"],
    correct: 1,
    explanation: "False. Scottie Pippen retired years before LeBron’s first championship. Nice try, MJ fans."
  }
];

// These locally stored images rotate with the questions. Format and dimensions
// let CSS reserve the correct frame without stretching or cropping each source.
const questionPhotos = [
  {
    src: "images/lebron-cavaliers.jpg",
    alt: "LeBron James on court for the Cleveland Cavaliers",
    caption: "Cleveland era",
    format: "landscape",
    width: 960,
    height: 640
  },
  {
    src: "images/lebron-heat.jpg",
    alt: "LeBron James on court for the Miami Heat",
    caption: "Miami era",
    format: "portrait",
    width: 500,
    height: 828
  },
  {
    src: "images/lebron-sixers.jpg",
    alt: "Philadelphia 76ers announcement welcoming LeBron James",
    caption: "Philadelphia era",
    format: "graphic",
    width: 1280,
    height: 720
  }
];

const playerForm = document.querySelector("#player-form");
const playerNameInput = document.querySelector("#player-name");
const headerPlayerName = document.querySelector("#header-player-name");
const welcomeScreen = document.querySelector("#welcome-screen");
const questionScreen = document.querySelector("#question-screen");
const opinionScreen = document.querySelector("#opinion-screen");
const resultScreen = document.querySelector("#result-screen");
const questionCounter = document.querySelector("#question-counter");
const liveScore = document.querySelector("#live-score");
const progressElement = document.querySelector("#quiz-progress");
const progressFill = document.querySelector("#quiz-progress-fill");
const questionCategory = document.querySelector("#question-category");
const questionText = document.querySelector("#question-text");
const questionImage = document.querySelector("#question-image");
const questionPhoto = questionImage?.closest(".question-photo");
const questionImageCaption = document.querySelector("#question-image-caption");
const answerGrid = document.querySelector("#answer-grid");
const answerFeedback = document.querySelector("#answer-feedback");
const nextQuestionButton = document.querySelector("#next-question");
const finalScore = document.querySelector("#final-score");
const finalTotal = document.querySelector("#final-total");
const resultTitle = document.querySelector("#result-title");
const resultDescription = document.querySelector("#result-description");
const playAgainButton = document.querySelector("#play-again");
const restartQuizButton = document.querySelector("#restart-quiz");
const shareScoreButton = document.querySelector("#share-score");
const shareFeedback = document.querySelector("#share-feedback");
const currentYear = document.querySelector("#current-year");
const goatForm = document.querySelector("#goat-form");
const goatChoiceInput = document.querySelector("#goat-choice");
const goatOptionButtons = [...document.querySelectorAll("[data-goat-choice]")];
const goatFollowUp = document.querySelector("#goat-follow-up");
const goatFollowUpLabel = document.querySelector("#goat-follow-up-label");
const goatResponse = document.querySelector("#goat-response");
const submissionPlayerName = document.querySelector("#submission-player-name");
const submissionScore = document.querySelector("#submission-score");
const finishQuizButton = document.querySelector("#finish-quiz");
const formStatus = document.querySelector("#form-status");

let currentQuestionIndex = 0;
let score = 0;
let answerLocked = false;
let playerName = "Player";
let goatChoice = "";

if (currentYear) currentYear.textContent = new Date().getFullYear();
if (finalTotal) finalTotal.textContent = `/ ${questions.length}`;

function paddedNumber(value) {
  return String(value).padStart(2, "0");
}

function showOnly(view) {
  [welcomeScreen, questionScreen, opinionScreen, resultScreen].forEach((screen) => {
    if (screen) screen.hidden = screen !== view;
  });

  view?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderQuestion() {
  const currentQuestion = questions[currentQuestionIndex];
  const currentPhoto = questionPhotos[currentQuestionIndex % questionPhotos.length];
  const questionNumber = currentQuestionIndex + 1;
  const progress = (currentQuestionIndex / questions.length) * 100;

  answerLocked = false;
  answerFeedback.textContent = "";
  nextQuestionButton.hidden = true;
  questionCategory.textContent = currentQuestion.category;
  questionText.textContent = currentQuestion.question;
  questionImage.src = currentPhoto.src;
  questionImage.alt = currentPhoto.alt;
  questionImage.width = currentPhoto.width;
  questionImage.height = currentPhoto.height;
  if (questionPhoto) questionPhoto.dataset.format = currentPhoto.format;
  questionImageCaption.textContent = currentPhoto.caption;
  questionCounter.textContent = `Question ${paddedNumber(questionNumber)} / ${paddedNumber(questions.length)}`;
  liveScore.textContent = paddedNumber(score);
  progressFill.style.width = `${progress}%`;
  progressElement.setAttribute("aria-valuenow", String(Math.round(progress)));
  answerGrid.replaceChildren();

  currentQuestion.answers.forEach((answer, answerIndex) => {
    const button = document.createElement("button");
    button.className = "answer-option";
    button.type = "button";
    button.dataset.letter = String.fromCharCode(65 + answerIndex);
    button.textContent = answer;
    button.addEventListener("click", () => selectAnswer(answerIndex));
    answerGrid.append(button);
  });
}

function selectAnswer(selectedIndex) {
  if (answerLocked) return;

  answerLocked = true;
  const currentQuestion = questions[currentQuestionIndex];
  const answerButtons = [...answerGrid.querySelectorAll(".answer-option")];
  const isCorrect = selectedIndex === currentQuestion.correct;

  if (isCorrect) score += 1;

  answerButtons.forEach((button, index) => {
    button.disabled = true;
    if (index === currentQuestion.correct) button.classList.add("is-correct");
    if (index === selectedIndex && !isCorrect) button.classList.add("is-incorrect");
  });

  answerFeedback.innerHTML = isCorrect
    ? `<strong>Bucket.</strong> ${currentQuestion.explanation}`
    : `<strong>Off the rim.</strong> ${currentQuestion.explanation}`;

  liveScore.textContent = paddedNumber(score);
  nextQuestionButton.textContent =
    currentQuestionIndex === questions.length - 1 ? "Final question" : "Next question";
  nextQuestionButton.hidden = false;
  nextQuestionButton.focus();
}

function showOpinionQuestion() {
  submissionPlayerName.value = playerName;
  submissionScore.value = `${score}/${questions.length}`;
  showOnly(opinionScreen);
  opinionScreen.querySelector("h2")?.focus?.();
}

function resetOpinionQuestion() {
  goatChoice = "";
  goatChoiceInput.value = "";
  goatResponse.value = "";
  goatFollowUp.hidden = true;
  formStatus.textContent = "";
  finishQuizButton.disabled = false;
  finishQuizButton.textContent = "Submit take & see score";
  goatOptionButtons.forEach((button) => {
    button.classList.remove("is-selected");
    button.setAttribute("aria-pressed", "false");
  });
}

function resultForScore() {
  const percentage = score / questions.length;

  if (percentage === 1) {
    return {
      title: "The Chosen One",
      description: `${playerName}, a perfect game. You know the King’s career from Akron to the record books.`
    };
  }

  if (percentage >= 0.75) {
    return {
      title: "All-Star",
      description: `${playerName}, you know your LeBron history. That is a playoff-level performance.`
    };
  }

  if (percentage >= 0.5) {
    return {
      title: "Starter",
      description: `${playerName}, a solid showing. A quick film session could take you to All-Star level.`
    };
  }

  if (percentage >= 0.25) {
    return {
      title: "Sixth Man",
      description: `${playerName}, you brought energy off the bench. Time to study the highlights.`
    };
  }

  return {
    title: "Rookie",
    description: `${playerName}, every legend starts somewhere. Run it back and chase a better score.`
  };
}

function showResults() {
  const result = resultForScore();
  finalScore.textContent = String(score);
  resultTitle.textContent = result.title;
  resultDescription.textContent = result.description;
  progressFill.style.width = "100%";
  progressElement.setAttribute("aria-valuenow", "100");
  showOnly(resultScreen);
  resultTitle.focus?.();
}

function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  answerLocked = false;
  shareFeedback.textContent = "";
  liveScore.textContent = "00";
  resetOpinionQuestion();
  showOnly(questionScreen);
  renderQuestion();
}

function returnToWelcome() {
  currentQuestionIndex = 0;
  score = 0;
  answerLocked = false;
  resetOpinionQuestion();
  showOnly(welcomeScreen);
  window.setTimeout(() => playerNameInput?.focus(), 50);
}

playerForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const enteredName = playerNameInput.value.trim();
  if (!enteredName) {
    playerNameInput.focus();
    return;
  }

  playerName = enteredName;
  headerPlayerName.textContent = playerName;
  startQuiz();
});

nextQuestionButton?.addEventListener("click", () => {
  if (!answerLocked) return;

  if (currentQuestionIndex >= questions.length - 1) {
    showOpinionQuestion();
    return;
  }

  currentQuestionIndex += 1;
  renderQuestion();
  questionText.focus?.();
});

goatOptionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    goatChoice = button.dataset.goatChoice;
    goatChoiceInput.value = goatChoice;

    goatOptionButtons.forEach((option) => {
      const isSelected = option === button;
      option.classList.toggle("is-selected", isSelected);
      option.setAttribute("aria-pressed", String(isSelected));
    });

    goatFollowUpLabel.textContent = goatChoice === "yes"
      ? "How do you feel about being right?"
      : "How do you feel about being wrong?";
    goatFollowUp.hidden = false;
    window.setTimeout(() => goatResponse.focus(), 50);
  });
});

// Send only the player's name, score and final GOAT take to the owner's Formspree form.
goatForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!goatChoice) {
    formStatus.textContent = "Pick yes or no first.";
    goatOptionButtons[0]?.focus();
    return;
  }

  finishQuizButton.disabled = true;
  finishQuizButton.textContent = "Submitting...";
  formStatus.textContent = "Sending your take to the scorer’s table...";

  try {
    const response = await fetch(goatForm.action, {
      method: "POST",
      body: new FormData(goatForm),
      headers: { Accept: "application/json" }
    });

    if (!response.ok) throw new Error("Form submission failed");
    showResults();
  } catch (error) {
    formStatus.textContent = "Your take could not be submitted. Check your connection and try again.";
    finishQuizButton.disabled = false;
    finishQuizButton.textContent = "Try submission again";
  }
});

playAgainButton?.addEventListener("click", startQuiz);
restartQuizButton?.addEventListener("click", returnToWelcome);

shareScoreButton?.addEventListener("click", async () => {
  const shareText = `I scored ${score}/${questions.length} on The LeBron James Quiz at lbjquiz.win. Can you beat me?`;

  try {
    if (navigator.share) {
      await navigator.share({ title: "The LeBron James Quiz", text: shareText, url: window.location.href });
      shareFeedback.textContent = "Score shared.";
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
      shareFeedback.textContent = "Score copied to your clipboard.";
    } else {
      shareFeedback.textContent = shareText;
    }
  } catch (error) {
    if (error.name !== "AbortError") {
      shareFeedback.textContent = "Sharing was unavailable. Copy the page address to challenge a friend.";
    }
  }
});
