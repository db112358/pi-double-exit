import { CustomEditor, type ExtensionAPI, type KeybindingsManager } from "@earendil-works/pi-coding-agent";
import { matchesKey, type EditorTheme, type TUI } from "@earendil-works/pi-tui";
const EXIT_TIMEOUT_MS = 1500;
type HintCallback = (msg: string | undefined) => void;
class DoubleExitEditor extends CustomEditor {
	private keybindingsRef: KeybindingsManager;
	private lastExitAt = 0;
	private exitTimer: ReturnType<typeof setTimeout> | null = null;
	private hint: HintCallback;
	constructor(tui: TUI, theme: EditorTheme, keybindings: KeybindingsManager, hint: HintCallback) {
		super(tui, theme, keybindings);
		this.keybindingsRef = keybindings;
		this.hint = hint;
	}
	private isExitKey(data: string): boolean {
		return this.keybindingsRef.getKeys("app.exit").some((key) => matchesKey(data, key));
	}
	private clearExitTimer(): void {
		if (this.exitTimer !== null) {
			clearTimeout(this.exitTimer);
			this.exitTimer = null;
		}
	}
	private cancelPendingExit(): void {
		this.clearExitTimer();
		if (this.lastExitAt !== 0) {
			this.lastExitAt = 0;
			this.hint(undefined);
		}
	}
	override handleInput(data: string): void {
		if (this.isExitKey(data) && this.getText().length === 0) {
			const now = Date.now();
			if (this.lastExitAt !== 0 && now - this.lastExitAt <= EXIT_TIMEOUT_MS) {
				this.cancelPendingExit();
				super.handleInput(data);
				return;
			}
			this.lastExitAt = now;
			this.clearExitTimer();
			this.exitTimer = setTimeout(() => {
				this.exitTimer = null;
				this.lastExitAt = 0;
				this.hint(undefined);
			}, EXIT_TIMEOUT_MS);
			this.exitTimer.unref?.();
			const keys = this.keybindingsRef.getKeys("app.exit").join("/");
			this.hint(`Press ${keys} again to quit`);
			return;
		}
		this.cancelPendingExit();
		super.handleInput(data);
	}
}
const HINT_KEY = "double-exit";
export default function (pi: ExtensionAPI) {
	pi.on("session_start", (_event, ctx) => {
		ctx.ui.setEditorComponent(
			(tui, theme, keybindings) =>
				new DoubleExitEditor(tui, theme, keybindings, (msg) => {
					if (!msg) {
						ctx.ui.setWidget(HINT_KEY, undefined);
						return;
					}
					ctx.ui.setWidget(HINT_KEY, (_tui, th) => ({
						render: () => [th.fg("warning", msg)],
						invalidate: () => {},
					}));
				}),
		);
	});
	pi.on("session_shutdown", (_event, ctx) => {
		ctx.ui.setWidget(HINT_KEY, undefined);
	});
}
