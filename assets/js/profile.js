"use strict";
(() => {
  const printButton = document.querySelector("[data-print-cv]");
  if (printButton) printButton.addEventListener("click", () => window.print());

  const header = document.querySelector(".site-header");
  if (!header) return;
  const navigation = Array.from(document.querySelectorAll(".main-nav a"));
  // Only the homepage has section navigation; other pages retain their page marker.
  const sections = document.getElementById("about")
    ? navigation.map(link => {
        const id = new URL(link.href, window.location.href).hash.slice(1);
        return { link, section: id ? document.getElementById(id) : null };
      }).filter(item => item.section)
    : [];
  let offset = 110;
  let scheduled = false;

  function updateCurrentSection() {
    scheduled = false;
    if (!sections.length) return;
    let current = sections[0];
    for (const item of sections) {
      if (item.section.getBoundingClientRect().top <= offset + 1) current = item;
    }
    // A short final section may never reach the top of the viewport.
    const last = sections[sections.length - 1];
    if (window.scrollY > 0 &&
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2 &&
        last.section.getBoundingClientRect().top < window.innerHeight) current = last;
    for (const link of navigation) {
      if (link === current.link) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
  }
  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(updateCurrentSection);
  }
  function measureHeader() {
    offset = Math.ceil(header.getBoundingClientRect().height) + 28;
    document.documentElement.style.setProperty("--anchor-offset", `${offset}px`);
    scheduleUpdate();
  }
  measureHeader();
  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("hashchange", scheduleUpdate);
  window.addEventListener("load", measureHeader);
  window.addEventListener("resize", measureHeader);
  if ("ResizeObserver" in window) new ResizeObserver(measureHeader).observe(header);
})();
