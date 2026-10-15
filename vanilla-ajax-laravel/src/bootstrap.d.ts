declare namespace bootstrap {
  class Modal {
    constructor(element: Element);
    show(): void;
    hide(): void;
  }
}

interface Window {
  bootstrap: typeof bootstrap;
}
