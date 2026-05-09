(function () {
  const nav = document.createElement("nav");
  nav.id = "site-nav";
  nav.innerHTML = `
    <div class="nav-inner">
      <a class="nav-brand" href="/">Efe Akbulut&thinsp;&middot;&thinsp;Interview Follow Up with Dao Nguyen</a>
      <img class="nav-logo" src="assets/BlackLogoT.jpeg" alt="The New York Times">
    </div>`;
  document.body.prepend(nav);
})();
