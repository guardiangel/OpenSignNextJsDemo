import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

let module1;
let formats;

export const EditorToolbar = ({ containerId }) => {
  const [isQuillReady, setIsQuillReady] = useState(false);
  const toolbarRef = useRef(null);


  useEffect(() => {
    // Ensure we are in the client-side environment
    const interval = setInterval(() => {
        clearInterval(interval); // Stop the interval once toolbarRef is assigned
        initializeQuill();
    }, 100);

    const initializeQuill = () => {
      if (typeof window !== 'undefined') {
        const Quill = require('react-quill-new').Quill;

        if (Quill) {
          const undoChange = () => Quill.history.undo();
          const redoChange = () => Quill.history.redo();

          // Add sizes to whitelist and register them
          const Size = Quill.import('formats/size');
          Size.whitelist = ['extra-small', 'small', 'medium', 'large'];
          Quill.register(Size, true);

          // Add fonts to whitelist and register them
          const Font = Quill.import('formats/font');
          Font.whitelist = [
            'arial',
            'comic-sans',
            'courier-new',
            'georgia',
            'helvetica',
            'lucida',
          ];
          Quill.register(Font, true);

          // Define the module and formats after Quill is loaded
          module1 = {
            toolbar: {
              container: toolbarRef.current, // Use the reference here
              handlers: {
                undo: undoChange,
                redo: redoChange,
              },
            },
            history: {
              delay: 500,
              maxStack: 100,
              userOnly: true,
            },
          };

          formats = [
            'header',
            'font',
            'size',
            'bold',
            'italic',
            'underline',
            'align',
            'strike',
            'script',
            'blockquote',
            'background',
            'list',
            'indent',
            'link',
            'image',
            'color',
            'code-block',
          ];

          setIsQuillReady(true); // Mark Quill as ready
        } else {
          console.error('Quill is not available.');
        }
      } else {
        console.error('Toolbar container not found.');
      }
    };
    return () => clearInterval(interval);
  }, [toolbarRef.current, containerId]);

  if (!isQuillReady) {
    return <div>Loading Quill Editor...</div>;
  }

  return (
    <div ref={toolbarRef} id="toolbar1">
      <span className="ql-formats">
        <select className="ql-font" defaultValue="arial">
          <option value="arial">Arial</option>
          <option value="comic-sans">Comic Sans</option>
          <option value="courier-new">Courier New</option>
          <option value="georgia">Georgia</option>
          <option value="helvetica">Helvetica</option>
          <option value="lucida">Lucida</option>
        </select>
        <select className="ql-size" defaultValue="medium">
          <option value="extra-small">Size 1</option>
          <option value="small">Size 2</option>
          <option value="medium">Size 3</option>
          <option value="large">Size 4</option>
        </select>
        <select className="ql-header" defaultValue="3">
          <option value="1">Heading</option>
          <option value="2">Subheading</option>
          <option value="3">Normal</option>
        </select>
      </span>
      <span className="ql-formats">
        <button className="ql-bold" />
        <button className="ql-italic" />
        <button className="ql-underline" />
        <button className="ql-strike" />
      </span>
      <span className="ql-formats">
        <button className="ql-list" value="ordered" />
        <button className="ql-list" value="bullet" />
        <button className="ql-indent" value="-1" />
        <button className="ql-indent" value="+1" />
      </span>
      <span className="ql-formats">
        <button className="ql-script" value="super" />
        <button className="ql-script" value="sub" />
        <button className="ql-blockquote" />
        <button className="ql-direction" />
      </span>
      <span className="ql-formats">
        <select className="ql-align" />
        <select className="ql-color" />
        <select className="ql-background" />
      </span>
      <span className="ql-formats">
        <button className="ql-link" />
        <button className="ql-image" />
        <button className="ql-video" />
      </span>
      <span className="ql-formats">
        <button className="ql-formula" />
        <button className="ql-code-block" />
        <button className="ql-clean" />
      </span>
      <span className="ql-formats">
        <button className="ql-undo">
          <svg viewBox="0 0 18 18">
            <polygon className="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10" />
            <path
              className="ql-stroke"
              d="M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9"
            />
          </svg>
        </button>
        <button className="ql-redo">
          <svg viewBox="0 0 18 18">
            <polygon className="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10" />
            <path
              className="ql-stroke"
              d="M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5"
            />
          </svg>
        </button>
      </span>
    </div>
  );
};

export { formats, module1 };

export default EditorToolbar;
