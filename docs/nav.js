(function () {
  const pages = [
    { label: "Home",                  href: "index.html" },
    { label: "What I Heard",          href: "what-i-heard.html" },
    { label: "Portfolio Map",         href: "portfolio-management-map.html" },
    { label: "Map Visualized",        href: "map-visualized.html" },
    { label: "Partnership Types",     href: "partnership-types.html" },
    { label: "Modular Architecture",  href: "modular-architecture.html" },
    { label: "Why This Excites Me",   href: "why-this-excites-me.html" },
    { label: "About",                 href: "about.html" },
  ];

  const current = window.location.pathname.split("/").pop() || "index.html";

  const items = pages
    .map(({ label, href }) => {
      const active = href === current || (current === "" && href === "index.html");
      return `<li><a href="${href}"${active ? ' class="active"' : ""}>${label}</a></li>`;
    })
    .join("");

  const nav = document.createElement("nav");
  nav.id = "site-nav";
  nav.innerHTML = `
    <div class="nav-inner">
      <a class="nav-brand" href="index.html">Efe Akbulut&thinsp;&middot;&thinsp;Partnerships Pitch</a>
      <ul class="nav-links">${items}</ul>
    </div>`;

  document.body.prepend(nav);
})();
