export function moveableElement(elmnt, header) {
  var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;

  header.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;

    // console.log('dragMouseDown', pos1, pos2, pos3, pos4);
    elmnt.classList.add('moveable');

    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    // console.log('elementDrag', elmnt.offsetTop, pos2, elmnt.offsetLeft, pos1);

    // set the element's new position:
    elmnt.style.top = elmnt.offsetTop - pos2 + 'px';
    elmnt.style.left = elmnt.offsetLeft - pos1 + 'px';
  }

  function closeDragElement() {
    // console.log('closeDragElement');
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
    elmnt.classList.remove('moveable');
  }
}

export function resizableElement(elmnt, resizer) {
  resizer.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e.preventDefault();
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
    elmnt.classList.add('moveable');
  }

  function elementDrag(e) {
    e.preventDefault();

    // console.log(`
    //   elmnt.offsetLeft: ${elmnt.offsetLeft}
    //          e.clientX: ${e.clientX}                 => ${e.clientX - elmnt.offsetLeft}
    //    elmnt.offsetTop: ${elmnt.offsetTop}
    //          e.clientY: ${e.clientY}                 => ${e.clientY - elmnt.offsetTop}
    // `);

    elmnt.style.width = e.clientX - elmnt.offsetLeft + resizer.offsetWidth / 2 + 'px';
    elmnt.style.height = e.clientY - elmnt.offsetTop + resizer.offsetWidth / 2 + 'px';
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
    elmnt.classList.remove('moveable');
  }
}
