import { toPng, toSvg } from 'html-to-image';

type AsyncHandler = () => Promise<void>;

let _pngHandler: AsyncHandler | null = null;
let _svgHandler: AsyncHandler | null = null;

export function registerDiagramExport(handlers: {
  png: AsyncHandler;
  svg: AsyncHandler;
}): void {
  _pngHandler = handlers.png;
  _svgHandler = handlers.svg;
}

export async function exportDiagramPng(): Promise<void> {
  if (_pngHandler) await _pngHandler();
}

export async function exportDiagramSvg(): Promise<void> {
  if (_svgHandler) await _svgHandler();
}

function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const exportFilter = (node: HTMLElement): boolean => {
  if (!node.classList) return true;
  return (
    !node.classList.contains('react-flow__controls') &&
    !node.classList.contains('react-flow__minimap') &&
    !node.classList.contains('react-flow__panel') &&
    !node.classList.contains('react-flow__attribution')
  );
};

export async function captureElementPng(
  el: HTMLElement,
  filename: string
): Promise<void> {
  const dataUrl = await toPng(el, {
    pixelRatio: 3,
    backgroundColor: '#ffffff',
    filter: exportFilter,
  });
  downloadDataUrl(dataUrl, filename);
}

export async function captureElementSvg(
  el: HTMLElement,
  filename: string
): Promise<void> {
  const dataUrl = await toSvg(el, {
    backgroundColor: '#ffffff',
    filter: exportFilter,
  });
  downloadDataUrl(dataUrl, filename);
}
