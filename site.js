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

  // copy buttons: data-copy names the element whose text goes on the clipboard
  document.querySelectorAll("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var el = document.getElementById(b.dataset.copy);
      if (!el) return;
      var text = el.textContent;
      function selectIt() {
        var r = document.createRange();
        r.selectNodeContents(el);
        var s = window.getSelection();
        s.removeAllRanges();
        s.addRange(r);
        say("Selected. Press Ctrl+C (or Cmd+C) to copy it.");
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          say("Copied. Paste it into your agent, then change the line in brackets.");
        }, selectIt);
      } else {
        selectIt();
      }
    });
  });

  // landing page only from here on
  var roomCode = document.getElementById("room-code");
  if (!roomCode) return;

  // paste-a-link form: no network calls here, it only builds the address and goes there
  var linkForm = document.getElementById("host-link");
  if (linkForm) {
    var linkInput = document.getElementById("game-link");
    var linkReply = document.getElementById("host-link-reply");
    linkForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = linkInput.value.trim();
      if (!v) { linkReply.textContent = "Paste a link first. Open your game's folder on GitHub and copy the address bar."; linkInput.focus(); return; }
      if (/^(www\.)?github\.com\//i.test(v)) v = "https://" + v;
      var host = "";
      try { host = new URL(v).hostname; } catch (err) {}
      if (host !== "github.com" && host !== "www.github.com") {
        linkReply.textContent = "That doesn't look like a GitHub link. Paste the address of a game folder on github.com.";
        linkInput.focus();
        return;
      }
      linkReply.textContent = "Taking you to play.friendslop.us. Nobody at friendslop has checked that game yet.";
      window.location.assign("https://play.friendslop.us/?host=" + encodeURIComponent(v));
    });
  }

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

  // join form: no network calls here either, it only checks the code's shape and goes there
  // The game server's room code alphabet (ROOM_ID_ALPHABET): no 0, O, 1, I or L.
  var ROOM_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  function isRoomCode(v) {
    if (v.length !== 6) return false;
    for (var i = 0; i < v.length; i++) if (ROOM_ALPHABET.indexOf(v.charAt(i)) < 0) return false;
    return true;
  }
  var reply = document.getElementById("join-reply");
  var input = document.getElementById("code");
  document.getElementById("join").addEventListener("submit", function (e) {
    e.preventDefault();
    var v = input.value.replace(/\s+/g, "").toUpperCase();
    if (!v) { reply.textContent = "Type a room code first. Ask the host for it."; input.focus(); return; }
    if (v === "SLOP") { reply.textContent = "Wrong password, right attitude."; return; }
    if (v.indexOf("SLOP") === 0) { reply.textContent = "That's the pretend room in the picture. Real room codes are six letters and numbers, and the host has yours."; input.focus(); return; }
    if (!isRoomCode(v)) { reply.textContent = "Room codes are six letters and numbers, like K7QX2M. Check the one the host sent and try again."; input.focus(); return; }
    reply.textContent = "Taking you to room " + v + " on play.friendslop.us.";
    window.location.assign("https://play.friendslop.us/?room=" + v);
  });
})();
