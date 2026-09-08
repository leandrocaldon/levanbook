declare module "page-flip" {
  export type WidgetEvent = {
    data: number | string | boolean | object | null;
    object: PageFlip;
  };

  export class PageFlip {
    constructor(element: HTMLElement, settings: Record<string, unknown>);
    loadFromHTML(items: HTMLElement[] | NodeListOf<HTMLElement>): void;
    destroy(): void;
    flipNext(): void;
    flipPrev(): void;
    turnToPage(page: number): void;
    getCurrentPageIndex(): number;
    getPageCount(): number;
    on(event: string, callback: (e: WidgetEvent) => void): PageFlip;
    off(event: string): void;
  }
}

declare module "pdfjs-dist/package.json" {
  export const version: string;
}
