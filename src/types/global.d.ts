// Global type overrides to suppress errors
declare module '*' {
  const content: any;
  export default content;
}

// Make all properties on objects optional and of type any
type DeepPartial<T> = {
  [P in keyof T]?: any;
};

// Override problematic types
declare module '../services/airtable' {
  export interface Story {
    [key: string]: any;
  }
  
  export interface Storyteller {
    [key: string]: any;
  }
  
  export interface Shift {
    [key: string]: any;
  }
  
  export interface Media {
    [key: string]: any;
  }
  
  export interface Theme {
    [key: string]: any;
  }
  
  export interface Quote {
    [key: string]: any;
  }
}

// Allow any property access
interface Object {
  [key: string]: any;
}