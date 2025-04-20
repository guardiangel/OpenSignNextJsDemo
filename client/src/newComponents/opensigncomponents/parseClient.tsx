import Parse from 'parse/dist/parse.min.js';

// Configure Parse (replace with your actual keys)
if (typeof window !== 'undefined') {
    Parse.initialize(process.env.NEXT_PUBLIC_XParseApplicationId, process.env.NEXT_PUBLIC_XParseMasterKey); // Use JavaScript Key (not Master Key)
    Parse.serverURL = process.env.NEXT_PUBLIC_OpenSignServerURL;
}

export default Parse;
