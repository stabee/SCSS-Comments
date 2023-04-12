# SCSS Nested Selector Comments

This is a Visual Studio Code extension that generates comments for nested selectors in SCSS files.

## Features

This extension will automatically generate comments for each nested selector in a SCSS file, using the name of the parent selector as a prefix for the child selector. For example:
```
.parent {

  &__header {
    color: red;
  }
}
```
will generate the following comments:
```
.parent {

  // .parent__header
  &__header {
    color: red;
  }
}
```

By default, the extension will not override previously made comments. However, you can enable the "Replace Existing Comments" setting to override existing comments.

## Usage

To generate comments for nested selectors, follow these steps:

1. Open a SCSS file in Visual Studio Code.
2. Open the Command Palette (Ctrl+Shift+P) and select "Comment SCSS Nested Selector".
3. The extension will generate a comment for all nested selectors.

Note that this extension will not generate comments for top-level parent selectors.

If you want to disable the extension temporarily, you can do so by going to the Extensions view (Ctrl+Shift+X), finding "SCSS Nested Selector Comments", and clicking "Disable".
