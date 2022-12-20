const getDialog = () => document.getElementById("photo-popup");
const getDialogImage = () => document.getElementById("dialog-img");
const getDialogLink = () => document.getElementById("open-orig");
const getBaseUrl = () =>
  document.querySelector("[name=image-base-url]").content;
const getMasonryFeatureElement = () =>
  document.getElementById("masonry-feature-support");

const closeModal = () => {
  const dialog = getDialog();

  const closeImpl = () => {
    dialog.close();
    dialog.removeEventListener("transitionend", closeImpl);
  };

  dialog.addEventListener("transitionend", closeImpl);
  dialog.classList.remove("in");
};

const openDialog = () => {
  const dialog = getDialog();
  dialog.showModal();
  dialog.classList.add("in");
};

const hideOverflow = () => {
  document.body.style.overflow = "hidden";
};

const showOverflow = () => {
  document.body.style.overflow = "visible";
};

const closeOnBackdropClick = event => {
  const dialog = getDialog();

  let rect = event.target.getBoundingClientRect();

  const outsideX = rect.left > event.clientX || rect.right < event.clientX;
  const outsideY = rect.top > event.clientY || rect.bottom < event.clientY;

  if (outsideX || outsideY) {
    closeModal();
  }
};

const openDialogForImage = imageWrapper => () => {
  const nestedImg = Array.from(imageWrapper.children).find(
    child => child.tagName === "IMG"
  );

  const dialogImage = getDialogImage();
  const dialogLink = getDialogLink();
  const baseUrl = getBaseUrl();

  dialogImage.src = nestedImg.src;
  dialogLink.href = `${baseUrl}/${nestedImg.dataset.imageKey}`;

  hideOverflow();
  openDialog();
};

document.addEventListener("DOMContentLoaded", () => {
  const dialog = getDialog();

  if (typeof dialog.showModal !== "function") {
    dialog.hidden = true;
    return;
  }

  dialog.addEventListener("click", closeOnBackdropClick);
  dialog.addEventListener("cancel", event => {
    event.preventDefault();
    closeModal();
  });
  dialog.addEventListener("close", showOverflow);

  const imageWrappers = document.getElementsByClassName("photo-wrapper");
  for (const imageWrapper of imageWrappers) {
    imageWrapper.addEventListener("click", openDialogForImage(imageWrapper));
  }

  if (CSS.supports("grid-template-rows", "masonry")) {
    getMasonryFeatureElement().innerText = "hell yea, masonry layout";
  }
});
