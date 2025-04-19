import "quill/dist/quill.snow.css"; // Import Quill's CSS
import { useQuill } from "react-quilljs";

const TestEditor = () => {
    const { quill, quillRef } = useQuill();
    return (
      <div style={{ width: 1000, height: 300 }}>
        <div ref={quillRef} />
      </div>
    );
};

export default TestEditor;
