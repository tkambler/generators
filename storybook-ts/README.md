# Components

    npm ci
    npm run build

- Copy `./dist/css` and `./dist/fonts` to your project's public HTML folder.
- Configure your project's module loader (e.g. WebPack) with an alias that resolves `shared-components` to this project's `dist/components` folder. Afterwards, components can be imported as shown below.

    import HelloWorld from 'shared-components/hello-world';
