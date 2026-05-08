(function () {
  const nav = document.createElement("nav");
  nav.id = "site-nav";
  nav.innerHTML = `
    <div class="nav-inner">
      <a class="nav-brand" href="/">Efe Akbulut&thinsp;&middot;&thinsp;Partnerships Pitch</a>
    </div>`;
  document.body.prepend(nav);
})();
