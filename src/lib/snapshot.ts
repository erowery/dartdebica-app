/**
 * Zapisuje wskazany fragment strony jako plik PNG w wysokiej rozdzielczości
 * (pixelRatio 3 = ok. 1920 px szerokości przy obszarze 640 px).
 */
export async function downloadNodeAsPng(node: HTMLElement, fileName: string): Promise<void> {
  const { toPng } = await import('html-to-image');
  const dataUrl = await toPng(node, {
    pixelRatio: 3,
    backgroundColor: '#000000',
    cacheBust: true,
    width: node.offsetWidth,
    height: node.offsetHeight,
    style: { margin: '0' },
  });
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
