export const toDataUrl = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = (e) => {
            resolve(e.target?.result);
        };
    });
};

// `generatePdfName` is used to generate file name
export const generatePdfName = (length) => {
    const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
    }
    return result;
};

export const getFileName = (fileUrl) => {
    if (fileUrl) {
        const url = new URL(fileUrl);
        const filename = url.pathname.substring(url.pathname.indexOf('_') + 1);
        return filename || '';
    } else {
        return '';
    }
};

export const openInNewTab = (url, target) => {
    if (target) {
        window.open(url, target, 'noopener,noreferrer');
    } else {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
};

// `generateTitleFromFilename` to generate Title of document from file name
export const generateTitleFromFilename = (filename) => {
    try {
        // Step 1: Trim whitespace
        let title = filename.trim();

        // Step 2: Remove the file extension (everything after the last '.')
        const lastDotIndex = title.lastIndexOf('.');
        if (lastDotIndex > 0) {
            title = title.substring(0, lastDotIndex);
        }

        // Step 3: Replace special characters (except Unicode letters, digits, spaces, and hyphens)
        title = title.replace(/[^\p{L}\p{N}\s-]/gu, ' ');

        // Step 4: Replace multiple spaces with a single space
        title = title.replace(/\s+/g, ' ');

        // Step 5: Capitalize first letter of each word (Title Case), handling Unicode characters
        title = title.replace(
            /\p{L}\S*/gu,
            (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );

        // Step 6: Restrict length of title (optional, let's say 100 characters)
        if (title.length > 100) {
            title = title.substring(0, 100).trim();
        }

        // Step 7: Handle empty or invalid title by falling back to "Untitled Document"
        if (!title || title.length === 0) {
            return 'Untitled Document';
        }

        return title;
    } catch (error) {
        // Handle unexpected errors gracefully by returning a default title
        console.error('Error generating title from filename:', error);
        return 'Untitled Document';
    }
};
