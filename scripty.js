let num1, num2, operacion = "+";
let puntos = 0, aciertos = 0, tiempoRestante = 60;
let timerInterval, juegoActivo = true;
let modoNumeros = "naturales";
let esNuevoRecordSession = false;
let historialPuntos = [];

const inputRespuesta = document.getElementById("respuesta-usuario");
const barraTiempo = document.getElementById("barra-tiempo");
const resultMsg = document.getElementById("resultado");

// --- GESTIÓN DE RÉCORDS INDEPENDIENTES ---

function calcularRecordGlobal() {
    const ops = ["+", "-", "*", "/"];
    let total = 0;
    
    // Solo suma récords del modo activo
    ops.forEach(op => {
        let valor = parseInt(localStorage.getItem(`record-${op}-${modoNumeros}`)) || 0;
        total += valor;
    });
    
    // Actualizar etiqueta visual
    const etiqueta = document.getElementById("etiqueta-global");
    etiqueta.innerText = modoNumeros === "naturales" ? "GLOBAL (NAT)" : "GLOBAL (ENT)";
    
    document.getElementById("record-global").innerText = total;
}

function actualizarRecordVisual() {
    let clave = `record-${operacion}-${modoNumeros}`;
    document.getElementById("record").innerText = localStorage.getItem(clave) || 0;
    document.getElementById("record").classList.remove("nuevo-record");
    calcularRecordGlobal();
}

// --- LÓGICA DEL JUEGO ---

function generarNumeros() {
    if (!juegoActivo) return;
    let min = modoNumeros === "enteros" ? -20 : 0;
    num1 = Math.floor(Math.random() * (20 - min + 1)) + min;
    num2 = Math.floor(Math.random() * (20 - min + 1)) + min;
    
    if (operacion === "/") {
        while (num2 === 0) num2 = Math.floor(Math.random() * 10) + 1;
        num1 = num2 * (Math.floor(Math.random() * 11) - 5);
    }
    
    let simbolo = operacion === "*" ? "•" : (operacion === "/" ? "÷" : operacion);
    let n2Txt = num2 < 0 ? `(${num2})` : num2;
    document.getElementById("numeros").innerText = `${num1} ${simbolo} ${n2Txt} =`;
}

function verificarRespuesta() {
    if (!juegoActivo || inputRespuesta.value === "") return;
    const respuesta = parseInt(inputRespuesta.value);
    let correcto;

    if (operacion === "+") correcto = num1 + num2;
    else if (operacion === "-") correcto = num1 - num2;
    else if (operacion === "*") correcto = num1 * num2;
    else if (operacion === "/") correcto = num1 / num2;

    if (respuesta === correcto) {
        puntos += 10; aciertos++;
        resultMsg.innerText = "¡Correcto! +10";
        resultMsg.style.color = "#27ae60";
    } else {
        puntos = Math.max(0, puntos - 5);
        resultMsg.innerText = `Error: era ${correcto}`;
        resultMsg.style.color = "#e74c3c";
    }

    let clave = `record-${operacion}-${modoNumeros}`;
    if (puntos > (localStorage.getItem(clave) || 0)) {
        localStorage.setItem(clave, puntos);
        document.getElementById("record").classList.add("nuevo-record");
        resultMsg.innerText = "¡NUEVO RÉCORD! 🔥";
        esNuevoRecordSession = true;
    }
    
    document.getElementById("puntos").innerText = puntos;
    actualizarRecordVisual();
    inputRespuesta.value = "";
    generarNumeros();
}

// --- TIEMPO Y FINAL ---

function iniciarCronometro() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        tiempoRestante--;
        barraTiempo.style.width = (tiempoRestante / 60) * 100 + "%";
        if (tiempoRestante <= 0) finalizarJuego();
    }, 1000);
}

function finalizarJuego() {
    juegoActivo = false;
    clearInterval(timerInterval);
    
    // Guardar en historial
    historialPuntos.push(puntos);
    if(historialPuntos.length > 5) historialPuntos.shift();

    document.getElementById("modal-final").style.display = "flex";
    document.getElementById("final-puntos").innerText = puntos;
    document.getElementById("final-rendimiento").innerText = (aciertos / 1).toFixed(1);
    
    // Mostrar historial simple en el modal
    document.getElementById("historial-final").innerText = "Últimas partidas: " + historialPuntos.join(", ");

    if (esNuevoRecordSession) {
        document.getElementById("modal-titulo").innerText = "🎊 ¡NUEVO RÉCORD! 🎊";
        document.getElementById("modal-titulo").style.color = "#f1c40f";
    }
}

function reiniciarJuego() {
    puntos = 0; aciertos = 0; tiempoRestante = 60; juegoActivo = true;
    esNuevoRecordSession = false;
    document.getElementById("modal-final").style.display = "none";
    document.getElementById("puntos").innerText = "0";
    resultMsg.innerText = "¡Mucha suerte!";
    resultMsg.style.color = "#333";
    inputRespuesta.value = "";
    inputRespuesta.disabled = false;
    inputRespuesta.focus();
    actualizarRecordVisual();
    generarNumeros();
    iniciarCronometro();
}

// --- EVENTOS ---

document.querySelectorAll(".operacion").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".operacion").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        operacion = btn.id === "suma" ? "+" : btn.id === "resta" ? "-" : btn.id === "multiplicacion" ? "*" : "/";
        actualizarRecordVisual();
        generarNumeros();
        inputRespuesta.focus();
    });
});

document.getElementById("tipo-numero").addEventListener("change", (e) => {
    modoNumeros = e.target.value;
    actualizarRecordVisual();
    reiniciarJuego();
});

inputRespuesta.addEventListener("keypress", (e) => { if (e.key === "Enter") verificarRespuesta(); });

window.onload = () => {
    actualizarRecordVisual();
    generarNumeros();
    iniciarCronometro();
};
