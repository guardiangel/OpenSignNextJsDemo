module.exports =
    process.env.NODE_ENV === 'production'
        ? require('pdfjs-dist/build/pdf.worker.min.js')
        : require('pdfjs-dist/build/pdf.worker.js');
