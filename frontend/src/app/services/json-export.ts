import { Injectable } from '@angular/core';

/** Triggers a browser download of `data` as a pretty-printed JSON file. No backend involved — pure client-side. */
@Injectable({ providedIn: 'root' })
export class JsonExportService {
  download(filename: string, data: unknown): void {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  }
}
