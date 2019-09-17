# Envcloak

`Envcloak` is a utility package that is used to change values of environment varialbles temporarily for testing and restore the original values after thing done.

## Installation

Via `npm`:

```shell
npm install --save-dev envcloak
```

## API

### Declaration

```javascript
var Envcloak = require('envcloak');
```

### Constructor

```javascript
var envcloak = new Envcloak(kwargs);
```

The constructor (`Envcloak`) receives an options that contains a map of key/values (`presets`) that will be used to override the corresponding environment variables in `process.env`. It backs up the current environment variables before overriding. These backed up values will be recovered when `reset()` method is invoked.

Example:

```javascript
var envbox = new Envcloak({
  presets: {
    APP_BUILT_VERSION: '0.1.2',
    NODE_ENV: 'beta'
  }
});
```

### Methods

#### `envcloak.setup(vars)`

The argument `vars` is an object that contains key/values which defined the name of variable and a new value of it, as illustrated by the following example:
```javascript
{
  APP_INSTANCES: 2,
  NODE_ENV: 'test'
}
```

This method returns the `envcloak` object itself.

#### `envcloak.reset()`

Method `reset()` clears the values of environment variables that assigned by `setup()` method, and restores the backup values for them. This method also returns the `envcloak` object itself.

#### `envcloak.toJSON()`

Method `toJSON()` returns a JSON object that contains the internal state of `envcloak`.

## License

MIT
