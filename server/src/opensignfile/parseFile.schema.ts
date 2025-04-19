// src/file/file.schema.ts
import { Schema } from 'mongoose';

export const ParseFileSchema = new Schema({
  file: { type: Schema.Types.Mixed, required: true },
});

export class File {
  file: any;
}
