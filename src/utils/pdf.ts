// Helper to create jsPDF instance with optional embedded UTF-8 font.
export async function createPdfWithFont(options: any = { orientation: 'portrait', unit: 'pt', format: 'a4' }) {
  // dynamic import so bundler includes jsPDF only when needed
  const jsPDF = (await import('jspdf')).default;
  const fontUrl = '/fonts/NotoSans-Regular.ttf'; // place your UTF-8 TTF here
  let fontLoaded = false;
  try {
    const res = await fetch(fontUrl);
    if (res && res.ok) {
      const ab = await res.arrayBuffer();
      const u8 = new Uint8Array(ab);
      // convert to binary string in chunks to avoid stack limits
      let binary = '';
      const chunk = 0x8000;
      for (let i = 0; i < u8.length; i += chunk) {
        binary += String.fromCharCode.apply(null, Array.from(u8.subarray(i, i + chunk)) as any);
      }
      const base64 = btoa(binary);
      // register font in jsPDF VFS
      // @ts-ignore
      jsPDF.API.addFileToVFS('NotoSans-Regular.ttf', base64);
      // @ts-ignore
      jsPDF.API.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
      fontLoaded = true;
    }
  } catch (e) {
    // ignore and fall back to default font
    // console.warn('Could not load TTF font for PDFs', e);
  }
  const doc = new jsPDF(options);
  if (fontLoaded) {
    try {
      doc.setFont('NotoSans');
    } catch (e) {
      // ignore
    }
  }
  return doc;
}
