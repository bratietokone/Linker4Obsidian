/** Type-checked boundary for the desktop Electron runtime, not a bundled dependency. */
type DialogResult = { canceled: boolean; filePaths: string[] };
type NativeDialog = { showOpenDialog: (options: { properties: string[] }) => Promise<DialogResult> };
type NativeShell = { openPath: (filename: string) => Promise<string>; showItemInFolder: (filename: string) => void };
const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object';

function getElectron(): unknown {
  // Electron is provided by Obsidian. The dynamic load stays isolated here.
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- Runtime Electron modules are not npm dependencies
  return require('electron') as unknown;
}
function getRemote(): unknown {
  // Optional compatibility fallback (not part of the packaged plugin).
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- Runtime Electron modules are not npm dependencies
  return require('@electron/remote') as unknown;
}
function asShell(value: unknown): NativeShell | null {
  if (!isRecord(value) || typeof value.openPath !== 'function' ||
      typeof value.showItemInFolder !== 'function') return null;
  return value as NativeShell;
}
function asDialog(value: unknown): NativeDialog | null {
  if (!isRecord(value) || typeof value.showOpenDialog !== 'function') return null;
  return value as NativeDialog;
}
function shell(): NativeShell {
  const electron = getElectron();
  const result = isRecord(electron) ? asShell(electron.shell) : null;
  if (!result) throw new Error('Electron shell is unavailable');
  return result;
}
export async function openLocalPath(filename: string): Promise<void> {
  const error = await shell().openPath(filename);
  if (error) throw new Error(error);
}
export async function revealLocalPath(filename: string): Promise<void> {
  shell().showItemInFolder(filename);
}
export async function pickLocalPath(kind: 'file' | 'directory'): Promise<string | null> {
  let dialog: NativeDialog | null = null;
  try {
    const electron = getElectron();
    if (isRecord(electron) && isRecord(electron.remote)) dialog = asDialog(electron.remote.dialog);
  } catch { /* Some desktop builds do not expose electron.remote. */ }
  if (!dialog) {
    try {
      const remote = getRemote();
      if (isRecord(remote)) dialog = asDialog(remote.dialog);
    } catch { /* Native dialog unavailable; the user can type an absolute path. */ }
  }
  if (!dialog) return null;
  const result: unknown = await dialog.showOpenDialog({
    properties: [kind === 'file' ? 'openFile' : 'openDirectory']
  });
  if (!isRecord(result) || typeof result.canceled !== 'boolean' ||
      !Array.isArray(result.filePaths) || !result.filePaths.every(file => typeof file === 'string')) {
    throw new Error('Unexpected response from the native file picker');
  }
  return result.canceled ? null : result.filePaths[0] ?? null;
}
