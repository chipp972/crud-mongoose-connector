declare module 'mongoose-plugin-events' {
  import { Schema } from 'mongoose';
  export default function eventsPlugin(schema: Schema, options: any): any;
}
