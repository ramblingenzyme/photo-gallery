const addCloseOnBackdrop = (dialog) => {
    dialog.addEventListener("click", (event) => {
        let rect = event.target.getBoundingClientRect();

        const outsideX = rect.left > event.clientX || rect.right < event.clientX;
        const outsideY = rect.top > event.clientY || rect.bottom < event.clientY;

        if (outsideX || outsideY) {
            dialog.close();
        }
    })
}

const addScrollOnClose = (dialog) => {
    dialog.addEventListener("close", () => {
        document.body.style.overflow = "visible";
    })
}

document.addEventListener("DOMContentLoaded", () => {
    const dialog = document.getElementById("photo-popup");
    const dialogContentWrapper = document.getElementById("dialog-wrapper");
    const dialogImage = document.getElementById("dialog-img")

    const imageWrappers = document.getElementsByClassName("photo-wrapper");

    if (typeof dialog.showModal !== "function") {
        dialog.hidden = true;
        return;
    } 


    addCloseOnBackdrop(dialog);
    addScrollOnClose(dialog);

    for (const imageWrapper of imageWrappers) {
        imageWrapper.addEventListener("click", () => {
            if (typeof dialog.showModal === "function") {
                const nestedImg = Array.from(imageWrapper.children).find(child => child.tagName === "IMG")

                dialogImage.src = nestedImg.src;

                document.body.style.overflow = "hidden";
                dialog.showModal();
            }
        })
    }
})
