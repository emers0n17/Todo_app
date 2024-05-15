function mudarTema(tema) {
  const body = document.body;

  if (tema === "light") {
    body.classList.remove("tema-escuro");
    body.classList.add("tema-claro");
  } else if (tema === "dark") {
    body.classList.remove("tema-claro");
    body.classList.add("tema-escuro");
  }
}

window.addEventListener('load', () => {
  mudarTema('light');
})