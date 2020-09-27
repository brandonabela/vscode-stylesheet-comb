# Style Comb Formatter for Visual Studio Code

This extension is a style formatter that aims to streamline stylesheets for CSS, LESS, SCSS and SASS. This is done by formatting and grouping properties making it more readable and consistent.

<p align="center">
    <a href="https://github.com/brandonabela/vscode-style-comb/">
        <img alt="GitHub Workflow Status" src="https://img.shields.io/github/workflow/status/brandonabela/vscode-style-comb/Main%20CI">
    </a>
    <a href="https://github.com/brandonabela/vscode-style-comb/">
        <img alt="Visual Studio Marketplace Installs" src="https://img.shields.io/visual-studio-marketplace/i/style-comb-formatter">
    </a>
    </a>
    <a href="https://github.com/brandonabela/vscode-style-comb/">
        <img alt="Visual Studio Marketplace Rating" src="https://img.shields.io/visual-studio-marketplace/r/style-comb-formatter">
    </a>
    <a href="https://github.com/brandonabela/vscode-style-comb/">
      <img alt="GitHub" src="https://img.shields.io/github/license/brandonabela/vscode-style-comb">
    </a>
</p>

![animated.gif](../master/assets/animated.gif)

See the [CHANGELOG](../master/CHANGELOG.md) for the latest changes

## Installation

Install through VS Code extensions. Search for <code> Style Comb Formatter </code>

[Visual Studio Code Market Place: Style Comb Formatter](https://marketplace.visualstudio.com/items?itemName=style-comb-formatter)

Can also be installed in VS Code: Launch VS Code Quick Open (<kbd>CTRL</kbd> + <kbd>P</kbd>), paste the following command and press enter.

```
ext install style-comb-formatter
```

## Usage

### Setting Default Formatter

```
1. CMD + Shift + P
2. Format Document With ...
3. Configure Default Formatter ...
4. Style Comb Formatter
```

### Using Command Palette (CMD/CTRL + SHIFT + P)

> The <kbd>CMD</kbd> key for Windows is <kbd>CTRL</kbd>

Applying formatting to the entire stylesheet.

```
1. CMD + Shift + P
2. Style Comb Formatter
```

### Keyboard Shortcuts (ALT + SHIFT + F)

Visual Studio Code provides default keyboard shortcuts for code formatting. 

If you don't like the defaults, you can rebind `editor.action.formatDocument` and `editor.action.formatSelection` in the keyboard shortcuts menu of vscode.

### Format On Save

Respects `editor.formatOnSave` setting. You can turn on format-on-save on a per-language basis by scoping the setting:

```json
// Set the default
"editor.formatOnSave": false,
// Enable per-language
"[css]": {
    "editor.formatOnSave": true
}
```
