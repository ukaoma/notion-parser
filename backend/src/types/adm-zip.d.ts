declare module 'adm-zip' {
  class AdmZip {
    constructor(buffer?: Buffer | string);
    getEntries(): Array<{
      entryName: string;
      isDirectory: boolean;
      getData(): Buffer;
    }>;
  }
  export = AdmZip;
} 