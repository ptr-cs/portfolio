export function getFullscreenElement(): Element | null {
    const d = document as any;
    return document.fullscreenElement || d.webkitFullscreenElement || d.mozFullScreenElement || d.msFullscreenElement || null;
}

export function requestFullscreen(el: HTMLElement): void {
    el.requestFullscreen().catch((err) => {
      console.error(`Error enabling fullscreen: ${err.message}`);
    });
}

export function exitFullscreen(): void {
    const d = document as any;
    (document.exitFullscreen || d.webkitExitFullscreen || d.mozCancelFullScreen || d.msExitFullscreen)?.call(document);
}