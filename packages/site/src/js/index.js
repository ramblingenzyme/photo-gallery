const getDialog = () => document.getElementById("photo-popup");
const getDialogImage = () => document.getElementById("dialog-img");
const getDialogLink = () => document.getElementById("open-orig");
const getImageHostUrl = () =>
  document.querySelector("[name=image-base-url]").content;
const getMasonryFeatureElement = () =>
  document.getElementById("masonry-feature-support");
const getImages = () => document.getElementsByClassName("photo-wrapper");

// The "in" class has a transition, which dims the background
const transitionModalBackgroundIn = (dialog = getDialog()) =>
  dialog.classList.add("in");
const transitionModalBackgroundOut = (dialog = getDialog()) =>
  dialog.classList.remove("in");

const hideOverflow = () => (document.body.style.overflow = "hidden");
const showOverflow = () => (document.body.style.overflow = "visible");

const addAutoRemovedHandler = (element, event, handler) => {
  const handlerWrapper = (...args) => {
    handler(...args);
    element.removeEventListener(event, handlerWrapper);
  };
  element.addEventListener(event, handlerWrapper);
};

const onOutsideClick = handler => clickEvent => {
  let rect = clickEvent.target.getBoundingClientRect();

  const outsideX =
    rect.left > clickEvent.clientX || rect.right < clickEvent.clientX;
  const outsideY =
    rect.top > clickEvent.clientY || rect.bottom < clickEvent.clientY;

  if (outsideX || outsideY) {
    handler(clickEvent);
  }
};

// implementations
const setDialogImage = (src, externalImagePath) => {
  const dialogImage = getDialogImage();
  const dialogLink = getDialogLink();
  const baseUrl = getImageHostUrl();

  dialogImage.src = src;
  dialogLink.href = `${baseUrl}/${externalImagePath}`;
};

const openDialog = () => {
  const dialog = getDialog();

  // Overflow hidden when the modal is open so that the user can't scroll the image list behind it.
  hideOverflow();
  dialog.showModal();
  requestAnimationFrame(() => transitionModalBackgroundIn(dialog));
};

const closeModal = () => {
  const dialog = getDialog();

  // Have to close after transitioning the background away because it's part of the modal itself.
  addAutoRemovedHandler(dialog, "close", showOverflow);
  addAutoRemovedHandler(dialog, "transitionend", () =>
    setTimeout(() => requestAnimationFrame(() => getDialog().close()), 200)
  );
  requestAnimationFrame(() => transitionModalBackgroundOut(dialog));
};

const openDialogForImage = image => () => {
  setDialogImage(image.src, image.dataset.imageKey);

  openDialog();
};

document.addEventListener("DOMContentLoaded", () => {
  const dialog = getDialog();

  if (typeof dialog.showModal !== "function") {
    dialog.hidden = true;
    return;
  }

  dialog.addEventListener("click", onOutsideClick(closeModal));
  dialog.addEventListener("cancel", event => {
    event.preventDefault();
    closeModal();
  });

  const images = getImages();
  for (const image of images) {
    image.addEventListener("click", openDialogForImage(image));
  }

  if (CSS.supports("grid-template-rows", "masonry")) {
    getMasonryFeatureElement().innerText = "hell yea, masonry layout";
  }
});
