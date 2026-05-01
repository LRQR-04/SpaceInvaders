const startBtn = document.getElementById("startBtn");
const menu = document.getElementById("menu");
const game = document.getElementById("game");

const nave = document.getElementById("nave");

const explosion = document.getElementById("explosion");
const shootSound = document.getElementById("shootSound");
const damageSound = document.getElementById("damageSound");

const correctSound = document.getElementById("correctSound");
const wrongSound = document.getElementById("wrongSound");
const timerSound = document.getElementById("timerSound");

const scoreElement = document.getElementById("score");
const vidasContainer = document.getElementById("vidas");

const quizModal = document.getElementById("quizModal");
const preguntaElemento = document.getElementById("pregunta");
const opcionesElemento = document.getElementById("opciones");
const timerElemento = document.getElementById("timer");

const endScreen = document.getElementById("endScreen");
const resultadoTitulo = document.getElementById("resultadoTitulo");
const finalScore = document.getElementById("finalScore");
const finalPreguntas = document.getElementById("finalPreguntas");
const finalCorrectas = document.getElementById("finalCorrectas");
const restartBtn = document.getElementById("restartBtn");

let score = 0;
let vidas = 5;

let balas = [];
let balasEnemigas = [];

let juegoIniciado = false;
let juegoPausado = false;
let respondiendo = false;
let juegoTerminado = false;

/* Control de disparo */
let puedeDisparar = true;
const COOLDOWN_DISPARO = 300;

let formacion = [];
let filas = 4;
let columnas = 8;

let direccion = 1;
let velocidadX = 1.5;
let bajada = 20;

/* Quiz */
let intervaloQuiz;
let tiempoRestante = 6;

let intervaloDisparoEnemigo;

let preguntas = [];
let preguntasTotales = 0;
let preguntasCorrectas = 0;

const spritesEnemigos = [
  "https://framerusercontent.com/images/gAkgciSiY2TXZDc1Yyzj74GUXDY.gif",
  "https://images.emojiterra.com/google/noto-emoji/animated-emoji/1f47e.gif",
  "https://www.educaciontrespuntocero.com/wp-content/uploads/2016/03/si-px.gif",
  "https://www.sdjv72.fr/wp-content/uploads/2019/02/SIDEF.gif",
  "https://images.squarespace-cdn.com/content/v1/5fba58582c9d4143d9022adf/768b567b-e1c0-42d9-8d94-aefe7886334c/Gorf-2.gif",
];

function reproducirAudio(audio) {
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
  audio.play();
}

function detenerTodosLosAudios() {
  const audios = [shootSound, explosion, correctSound, wrongSound, timerSound];

  audios.forEach((audio) => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  });
}

async function cargarPreguntas() {
  try {
    const res = await fetch("./preguntas.json");
    preguntas = await res.json();

    console.log("Preguntas cargadas:", preguntas);
  } catch (error) {
    console.error("Error cargando preguntas:", error);
  }
}

document.body.classList.add("menu-bg");

startBtn.addEventListener("click", async () => {
  await cargarPreguntas();

  menu.style.display = "none";
  game.classList.remove("hidden");

  document.body.classList.remove("menu-bg");
  document.body.classList.add("game-bg");

  iniciarJuego();
});

function iniciarJuego() {
  if (juegoIniciado) return;
  juegoIniciado = true;

  actualizarScore();
  actualizarVidas();

  crearFormacion();

  intervaloDisparoEnemigo = setInterval(disparoEnemigo, 1200);

  gameLoop();
}

/* Movimiento nave */
document.addEventListener("mousemove", (e) => {
  if (!juegoIniciado || juegoPausado) return;
  nave.style.left = e.clientX - nave.offsetWidth / 2 + "px";
});

/* Disparo nave */
document.addEventListener("click", (e) => {
  if (quizModal.classList.contains("hidden") === false) return;
  if (!juegoIniciado || !puedeDisparar || juegoPausado) return;

  puedeDisparar = false;

  setTimeout(() => {
    puedeDisparar = true;
  }, COOLDOWN_DISPARO);

  const bala = document.createElement("div");
  bala.classList.add("bala");

  bala.x = nave.offsetLeft + nave.offsetWidth / 2;
  bala.y = nave.offsetTop;

  bala.style.left = bala.x + "px";
  bala.style.top = bala.y + "px";

  game.appendChild(bala);
  balas.push(bala);

  reproducirAudio(shootSound);
});

/* Crear formación */
function crearFormacion() {
  for (let fila = 0; fila < filas; fila++) {
    for (let col = 0; col < columnas; col++) {
      const enemigo = document.createElement("div");
      enemigo.classList.add("enemigo");

      enemigo.x = col * 70 + 100;
      enemigo.y = fila * 60 + 50;

      enemigo.style.left = enemigo.x + "px";
      enemigo.style.top = enemigo.y + "px";

      const sprite =
        spritesEnemigos[Math.floor(Math.random() * spritesEnemigos.length)];
      enemigo.style.backgroundImage = `url(${sprite})`;

      game.appendChild(enemigo);
      formacion.push(enemigo);
    }
  }
}

/* Movimiento formación */
function moverFormacion() {
  let tocarBorde = false;

  formacion.forEach((enemigo) => {
    enemigo.x += velocidadX * direccion;

    if (enemigo.x <= 0 || enemigo.x >= window.innerWidth - 50) {
      tocarBorde = true;
    }
  });

  if (tocarBorde) {
    direccion *= -1;

    formacion.forEach((enemigo) => {
      enemigo.y += bajada;
    });
  }

  formacion.forEach((enemigo) => {
    enemigo.style.left = enemigo.x + "px";
    enemigo.style.top = enemigo.y + "px";
  });
}

/* Disparo enemigo */
function disparoEnemigo() {
  if (formacion.length === 0 || juegoPausado) return;

  const enemigo = formacion[Math.floor(Math.random() * formacion.length)];

  const bala = document.createElement("div");
  bala.classList.add("bala");

  bala.x = enemigo.x + 25;
  bala.y = enemigo.y + 50;

  bala.style.left = bala.x + "px";
  bala.style.top = bala.y + "px";

  game.appendChild(bala);
  balasEnemigas.push(bala);
}

/* Explosión */
function crearExplosion(x, y) {
  const exp = document.createElement("div");
  exp.classList.add("explosion");

  exp.style.left = x + "px";
  exp.style.top = y + "px";

  game.appendChild(exp);

  setTimeout(() => {
    exp.remove();
  }, 300);
}

/* Quiz */
function pausarParaPregunta() {
  if (preguntas.length === 0) {
    console.error("No hay preguntas cargadas");
    return;
  }

  preguntasTotales++;
  juegoPausado = true;

  clearInterval(intervaloDisparoEnemigo);

  if (shootSound) {
    shootSound.pause();
    shootSound.currentTime = 0;
  }

  const pregunta = preguntas[Math.floor(Math.random() * preguntas.length)];

  preguntaElemento.textContent = pregunta.pregunta;
  opcionesElemento.innerHTML = "";

  pregunta.opciones.forEach((op) => {
    const btn = document.createElement("button");
    btn.textContent = op;
    btn.onclick = () => responder(op, pregunta.respuesta);
    opcionesElemento.appendChild(btn);
  });

  quizModal.classList.remove("hidden");
  iniciarTimerPregunta();
}

function iniciarTimerPregunta() {
  tiempoRestante = 6;
  timerElemento.textContent = tiempoRestante;

  reproducirAudio(timerSound);

  intervaloQuiz = setInterval(() => {
    tiempoRestante--;
    timerElemento.textContent = tiempoRestante;

    if (tiempoRestante <= 0) {
      clearInterval(intervaloQuiz);
      reproducirAudio(wrongSound);

      setTimeout(() => {
        respuestaIncorrecta();
      }, 800);
    }
  }, 1000);
}

function responder(opcion, correcta) {
  if (respondiendo) return;
  respondiendo = true;

  clearInterval(intervaloQuiz);

  const botones = opcionesElemento.querySelectorAll("button");

  botones.forEach((btn) => {
    btn.disabled = true;

    if (btn.textContent === correcta) btn.style.background = "green";
    else if (btn.textContent === opcion) btn.style.background = "red";
  });

  if (opcion === correcta) {
    preguntasCorrectas++;
    reproducirAudio(correctSound);

    setTimeout(() => {
      cerrarModal();
    }, 800);
  } else {
    reproducirAudio(wrongSound);

    setTimeout(() => {
      respuestaIncorrecta();
    }, 800);
  }
}

function respuestaIncorrecta() {
  vidas--;
  actualizarVidas();

  if (vidas <= 0) {
    setTimeout(() => {
      finalizarJuego(false);
    }, 800);

    return;
  }

  cerrarModal();
}

function cerrarModal() {
  quizModal.classList.add("hidden");

  if (timerSound) {
    timerSound.pause();
    timerSound.currentTime = 0;
  }

  clearInterval(intervaloDisparoEnemigo);

  setTimeout(() => {
    juegoPausado = false;
    respondiendo = false;

    intervaloDisparoEnemigo = setInterval(disparoEnemigo, 1200);
  }, 800);
}

function finalizarJuego(gano) {
  juegoTerminado = true;
  juegoPausado = true;

  clearInterval(intervaloDisparoEnemigo);

  detenerTodosLosAudios();

  endScreen.classList.remove("hidden");

  resultadoTitulo.textContent = gano ? "¡GANASTE!" : "GAME OVER";
  finalScore.textContent = "Puntaje: " + score;
  finalPreguntas.textContent = "Preguntas totales: " + preguntasTotales;
  finalCorrectas.textContent = "Correctas: " + preguntasCorrectas;
}

restartBtn.addEventListener("click", () => {
  location.reload();
});

function actualizarVidas() {
  const barras = vidasContainer.children;

  for (let i = 0; i < barras.length; i++) {
    barras[i].style.visibility = i < vidas ? "visible" : "hidden";
  }
}

function actualizarScore() {
  scoreElement.textContent = "SCORE: " + score;
}

/* Detectar colisiones */
function colision(a, b) {
  const r1 = a.getBoundingClientRect();
  const r2 = b.getBoundingClientRect();

  return !(
    r1.top > r2.bottom ||
    r1.bottom < r2.top ||
    r1.right < r2.left ||
    r1.left > r2.right
  );
}

function gameLoop() {
  if (juegoTerminado) return;

  if (juegoPausado) {
    requestAnimationFrame(gameLoop);
    return;
  }

  moverFormacion();

  /* Balas jugador */
  for (let i = balas.length - 1; i >= 0; i--) {
    let bala = balas[i];

    bala.y -= 10;
    bala.style.top = bala.y + "px";

    if (bala.y < 0) {
      bala.remove();
      balas.splice(i, 1);
    }
  }

  /* Balas enemigas */
  for (let i = balasEnemigas.length - 1; i >= 0; i--) {
    let bala = balasEnemigas[i];

    bala.y += 5;
    bala.style.top = bala.y + "px";

    if (colision(bala, nave)) {
      bala.remove();
      balasEnemigas.splice(i, 1);

      pausarParaPregunta();
      break;
    }

    if (bala.y > window.innerHeight) {
      bala.remove();
      balasEnemigas.splice(i, 1);
    }
  }

  /* Colisiones */
  for (let bi = balas.length - 1; bi >= 0; bi--) {
    for (let ei = formacion.length - 1; ei >= 0; ei--) {
      if (colision(balas[bi], formacion[ei])) {
        crearExplosion(formacion[ei].x, formacion[ei].y);

        if (explosion) {
          explosion.currentTime = 0;
          explosion.play();
        }

        formacion[ei].remove();
        balas[bi].remove();

        formacion.splice(ei, 1);
        balas.splice(bi, 1);

        score += 10;
        actualizarScore();
        break;
      }
    }
  }

  if (formacion.length === 0) {
    finalizarJuego(true);
    return;
  }

  requestAnimationFrame(gameLoop);
}
