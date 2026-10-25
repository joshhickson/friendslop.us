// friendslop.us: theme switcher on every page, plus the landing page's toys
(function () {
  var root = document.documentElement;

  // theme, remembered per viewer when storage works
  var buttons = document.querySelectorAll("[data-set-theme]");
  function setTheme(name) {
    root.setAttribute("data-theme", name);
    buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.setTheme === name)); });
    try { localStorage.setItem("friendslop-theme", name); } catch (e) {}
  }
  buttons.forEach(function (b) { b.addEventListener("click", function () { setTheme(b.dataset.setTheme); }); });
  var current = root.getAttribute("data-theme") || "blockout";
  buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.setTheme === current)); });

  // toast
  var toast = document.getElementById("toast"), toastTimer;
  function say(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2800);
  }

  // landing page only from here on
  var roomCode = document.getElementById("room-code");
  if (!roomCode) return;

  // a fresh room code each visit
  var code = "SLOP-" + String(Math.floor(1000 + Math.random() * 9000));
  roomCode.textContent = code;

  // players join once, on load
  var feed = document.getElementById("feed");
  var joins = [
    "the_host made the room.",
    "bot_doug joined Blu.",
    "xX_flagthief_Xx joined Red.",
    "camper_supreme joined Blu and immediately went to a corner.",
    "bot_greg joined Red.",
    "One slot left. It has your name on it."
  ];
  var order = [0, 3, 1, 4, 2, 5];
  var items = document.querySelectorAll(".team li");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  order.forEach(function (idx, step) {
    setTimeout(function () {
      items[idx].classList.add("in");
      feed.innerHTML = "<p></p>";
      feed.firstChild.textContent = joins[step];
    }, reduce ? 0 : 500 + step * 650);
  });

  // start match
  var startLines = [
    "Can't start: the host is still building the map.",
    "Can't start: bot_greg is stuck in a wall.",
    "Can't start: someone has to be Blu.",
    "Can't start: it isn't out yet. Soon."
  ], startIdx = 0;
  document.getElementById("start").addEventListener("click", function () {
    say(startLines[startIdx % startLines.length]);
    startIdx++;
  });

  // join form
  var reply = document.getElementById("join-reply");
  var input = document.getElementById("code");
  document.getElementById("join").addEventListener("submit", function (e) {
    e.preventDefault();
    var v = input.value.trim().toUpperCase();
    if (!v) { reply.textContent = "Type a room code first. Ask the host for it."; input.focus(); return; }
    if (v === code) { reply.textContent = "That's the room on this page. Nice reading. It opens at launch."; return; }
    if (v === "FRIENDSLOP" || v === "SLOP") { reply.textContent = "Wrong password, right attitude."; return; }
    reply.textContent = "Room " + v + " doesn't exist yet. Nothing does. Check back at launch.";
  });
})();
