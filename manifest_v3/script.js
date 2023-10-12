if (!document.querySelector(".collapse-toggle")) {
  // get boardid
  var boardid = window.location.href.substring(
    window.location.href.indexOf("/b/") + 3,
    window.location.href.indexOf("/b/") + 11
  );
  // get all lists
  document.querySelectorAll('[data-testid="list-header"]').forEach(e => {
    e.classList.add("-list-header")
    e.parentNode.classList.add("-list")
    e.parentNode.parentNode.classList.add("-list-wrapper")
    e.firstChild.firstChild.classList.add("-list-name")
    e.firstChild.firstChild.nextSibling.classList.add("-list-name-textarea")
    // encoded list title for unique id
    var columnName = encodeURI(e.textContent);
    // get isClosed value from chrome extension storage
    chrome.storage.local.get(boardid + ":" + columnName, isClosed => {
      // if this list is closed, add the -closed class
      if (isClosed[boardid + ":" + columnName]) {
        e.parentNode.parentNode.classList.add("-closed");
        e.parentNode.parentNode.classList.add("-cl");
      }
      // create toggle button
      var toggle = document.createElement("div");
      toggle.className = "collapse-toggle";
      // toggle click handler
      toggle.addEventListener("click", evt => {
        // get column name from event target
        var thisColumn = encodeURI(evt.target.nextSibling.textContent);
        // set isClosed value in chrome storage to inverse value
        chrome.storage.local.set(
          {
            [boardid + ":" + thisColumn]: isClosed[boardid + ":" + columnName]
              ? null
              : true
          },
          res => {
            // toggle the -closed class on successful save
            evt.target.parentNode.parentNode.parentNode.classList.toggle(
              "-closed"
            );
            evt.target.parentNode.parentNode.parentNode.classList.toggle(
              "-cl"
            );
          }
        );
      });
      // insert toggle button
      e.insertBefore(toggle, e.firstChild);
    });
  });
  // we want to open lists after a short delay if a user is dragging a card on top of one
  var isClosed, openList;
  document.querySelectorAll('[data-testid="list-card"]').forEach(lc => {
    lc.addEventListener("mousemove", lce => {
      document.querySelectorAll('[data-testid="list-wrapper"].-cl').forEach(l => {
        const c = l.getBoundingClientRect();
        //console.log(c);
        //console.log(lce.pageX + " " + lce.pageY);
        if (
          lce.pageX > c.left &&
          lce.pageX < c.right &&
          lce.pageY > c.top &&
          lce.pageY < c.bottom
        ) {
          if (!openList) {
            // we use a timeout here so that users can drag cards across a closed list without
            // opening it right away.
            openList = setTimeout(() => {
              l.classList.add("-open");
              l.classList.remove("-closed");
            }, 250);
          }
        } else {
          clearTimeout(openList);
          openList = null;
          if (l.classList.contains("-open")) {
            l.classList.remove("-open");
            l.classList.add("-closed");
          }
        }
      });
    });
  });
}
